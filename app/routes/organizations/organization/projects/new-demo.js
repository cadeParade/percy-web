import Ember from 'ember';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {task, timeout} from 'ember-concurrency';

const MAX_REFRESH_REQUESTS = 6;
const WAIT_TIME = 10; // in minutes
const MILLISECONDS_IN_MIN = 60000;

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    const organization = this.modelFor('organizations.organization');
    const demoProject = this.get('store').createRecord('project', {organization, isDemo: true});

    return demoProject;
  },

  // save in afterModel so we can render a loading template while we wait
  afterModel(demoProject) {
    this.saveProcess(demoProject);
  },

  async saveProcess(demoProject) {
    const initialSaveResult = await this.saveDemo(demoProject);
    if (initialSaveResult.error) {
      this.controller.set('hasError', true);
      this.saveDemoRetryTask.perform(demoProject);
    } else {
      this.transitionToDemo(demoProject);
    }
  },

  saveDemoRetryTask: task(function*(demoProject) {
    let _numPollRequests = 0;

    for (_numPollRequests; _numPollRequests < MAX_REFRESH_REQUESTS; _numPollRequests) {
      const saveRetry = yield this.saveDemo(demoProject);
      const error = saveRetry.error;

      if (error) {
        if (Ember.testing) {
          return;
        } else {
          yield timeout(WAIT_TIME * MILLISECONDS_IN_MIN);
        }
      } else {
        // if there is no error then clear errors and route to demo project
        this.controller.set('hasError', false);
        this.transitionToDemo(demoProject);
        return;
      }
    }
  }).drop(),

  async transitionToDemo(demoProject) {
    const organization = this.modelFor('organizations.organization');

    const builds = await demoProject.get('builds');
    if (builds.get('length') > 2) {
      const secondBuild = builds.findBy('buildNumber', 2);
      this.transitionTo(
        'organization.project.builds.build',
        organization.get('slug'),
        demoProject.get('slug'),
        secondBuild.get('id'),
      );
    } else {
      this.transitionTo('organization.project', organization.get('slug'), demoProject.get('slug'));
    }
  },

  async saveDemo(demo) {
    return demo.save().then(
      () => true,
      error => {
        return {error};
      },
    );
  },

  actions: {
    willTransition() {
      this.saveDemoRetryTask.cancelAll();
    },
  },
});
