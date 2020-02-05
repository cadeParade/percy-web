import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Ember from 'ember';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {task, timeout} from 'ember-concurrency';
import {hash} from 'rsvp';

const WAIT_TIME = 10; // in minutes
const MILLISECONDS_IN_MIN = 60000;

// Remove @classic when we can refactor away from mixins
@classic
export default class NewDemoRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  redirects;

  @service
  tooltips;

  model() {
    const organization = this.modelFor('organizations.organization');

    return hash({
      organization,
      projects: organization.get('projects'),
    });
  }

  // save in afterModel so we can render a loading template while we wait
  afterModel(model) {
    const organization = model.organization;
    const projects = model.projects;

    if (projects.length === 0) {
      const demoProject = this.store.createRecord('project', {organization, isDemo: true});
      this.saveProcess(demoProject);
    } else if (projects.length === 1 && projects.lastObject.isNew) {
      this.saveProcess(projects.lastObject);
    } else if (projects.length === 1 && projects.lastObject.isDemo) {
      this.transitionToDemo(projects.lastObject);
    } else {
      this.redirects.redirectToRecentProjectForOrg(organization);
    }
  }

  async saveProcess(demoProject) {
    const initialSaveResult = await this.saveDemo(demoProject);
    if (initialSaveResult.error) {
      this.controller.set('hasError', true);
      this.saveDemoRetryTask.perform();
    } else {
      this.transitionToDemo(demoProject);
    }
  }

  @(task(function*() {
    if (Ember.testing) {
      // used to test for correct redirect after error in organization acceptance test
      this._testingRefreshOnce();
      return;
    }

    yield timeout(WAIT_TIME * MILLISECONDS_IN_MIN);
    this.refresh();
  }).drop())
  saveDemoRetryTask;

  // only for organization acceptance testing
  _testingCanRefreshOnce = true;

  _testingRefreshOnce() {
    if (this._testingCanRefreshOnce === true) {
      this.set('_testingCanRefreshOnce', false);
      this.refresh();
    }
  }

  async transitionToDemo(demoProject) {
    const organization = this.modelFor('organizations.organization');

    this.tooltips.unhideAll();
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
  }

  async saveDemo(demo) {
    return demo.save().then(
      () => true,
      error => {
        return {error};
      },
    );
  }

  @action
  willTransition() {
    this.saveDemoRetryTask.cancelAll();
  }
}
