import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';
import utils from 'percy-web/lib/utils';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),
  intercom: service(),

  model() {
    const project = this.modelFor('organization.project');
    const browserFamilies = this.get('store').findAll('browserFamily');
    const webhookConfigs = project.get('webhookConfigs');

    return hash({project, browserFamilies, webhookConfigs});
  },

  actions: {
    deleteWebhookConfig(webhookConfig, confirmationMessage) {
      if (confirmationMessage && !utils.confirmMessage(confirmationMessage)) {
        return;
      }

      return webhookConfig.destroyRecord().then(() => {
        this.get('flashMessages').success('Successfully deleted webhook');
        this.refresh();
      });
    },

    removeProjectBrowserTargetForFamily(familyToRemove, project) {
      const projectBrowserTargetForFamily = project
        .get('projectBrowserTargets')
        .find(function(pbt) {
          return pbt.get('browserTarget.browserFamily.id') === familyToRemove.get('id');
        });

      projectBrowserTargetForFamily
        .destroyRecord()
        .then(() => {
          this.get('flashMessages').success(
            `All builds for this project going forward will not be run with ${familyToRemove.get(
              'name',
            )}.`,
            {title: 'Oh Well.'},
          );
        })
        .catch(() => {
          this.get('flashMessages').danger('Something went wrong. Please try again later');
        });
      this._callAnalytics('Browser Family Removed', {
        browser_family_slug: familyToRemove.get('slug'),
      });
    },

    addProjectBrowserTargetForFamily(familyToAdd, project) {
      const newProjectBrowserTarget = this.get('store').createRecord('projectBrowserTarget', {
        project,
        browserFamily: familyToAdd,
      });
      newProjectBrowserTarget
        .save()
        .then(() => {
          this.get('flashMessages').success(
            `Great! All builds for this project going forward will be run with ${familyToAdd.get(
              'name',
            )}.`,
          );
        })
        .catch(() => {
          this.get('flashMessages').danger('Something went wrong. Please try again later');
        });
      this._callAnalytics('Browser Family Added', {browser_family_slug: familyToAdd.get('slug')});
    },
  },

  _callAnalytics(actionName, extraProps) {
    const organization = this.get('project.organization');
    const props = {
      project_id: this.get('project.id'),
    };
    const allProps = Object.assign({}, extraProps, props);
    this.get('analytics').track(actionName, organization, allProps);
  },
});
