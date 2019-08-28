import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),
  intercom: service(),
  router: service(),

  model() {
    const project = this.modelFor('organization.project');
    const browserFamilies = this.store.findAll('browserFamily');

    return hash({project, browserFamilies});
  },

  setupController(controller, model) {
    controller.setProperties({
      model,
      badgeMarkdown: this._badgeMarkdown(model.project),
    });
  },

  _badgeMarkdown(project) {
    // Making this string two lines messes up the formatting.
    return `[![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](${this._badgeLinkURL(project)})`; //eslint-disable-line
  },

  _badgeLinkURL(project) {
    const origin = window.location.origin;
    return `${origin}${this.router.urlFor(
      'organization.project',
      project.get('organization'),
      project,
    )}`;
  },

  actions: {
    removeProjectBrowserTargetForFamily(familyToRemove, project) {
      const projectBrowserTargetForFamily = project
        .get('projectBrowserTargets')
        .find(function(pbt) {
          return pbt.get('browserTarget.browserFamily.id') === familyToRemove.get('id');
        });

      projectBrowserTargetForFamily
        .destroyRecord()
        .then(() => {
          this.flashMessages.success(
            `All builds for this project going forward will not be run with ${familyToRemove.get(
              'name',
            )}.`,
            {title: 'Oh Well.'},
          );
        })
        .catch(e => {
          const errors = e.errors;
          if (Array.isArray(errors)) {
            this.flashMessages.danger(this._errorsWithDetails(errors).mapBy('detail'));
          } else {
            this.flashMessages.danger('Something went wrong. Please try again later');
          }
        });
      this._callAnalytics('Browser Family Removed', {
        browser_family_slug: familyToRemove.get('slug'),
      });
    },

    addProjectBrowserTargetForFamily(familyToAdd, project) {
      const newProjectBrowserTarget = this.store.createRecord('projectBrowserTarget', {
        project,
        browserFamily: familyToAdd,
      });
      newProjectBrowserTarget
        .save()
        .then(() => {
          this.flashMessages.success(
            `Great! All builds for this project going forward will be run with ${familyToAdd.get(
              'name',
            )}.`,
          );
        })
        .catch(() => {
          this.flashMessages.danger('Something went wrong. Please try again later');
        });
      this._callAnalytics('Browser Family Added', {browser_family_slug: familyToAdd.get('slug')});
    },

    onCopyBadgeMarkdown() {
      this.flashMessages.success('Badge markdown was copied to your clipboard');
    },
  },

  _errorsWithDetails(errors) {
    return errors.filter(error => {
      return !!error.detail;
    });
  },

  _callAnalytics(actionName, extraProps) {
    const organization = this.get('project.organization');
    const props = {
      project_id: this.get('project.id'),
    };
    const allProps = Object.assign({}, extraProps, props);
    this.analytics.track(actionName, organization, allProps);
  },
});
