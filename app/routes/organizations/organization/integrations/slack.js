import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';
import $ from 'jquery';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('organizations.organization');
  },

  setupController(controller, model) {
    controller.set('organization', model);
  },

  actions: {
    connectSlackChannel() {
      $.ajax({
        type: 'POST',
        url: utils.buildApiUrl(
          'slackIntegrationRequests',
          this.paramsFor('organizations.organization').organization_id,
        ),
      }).done(response => {
        utils.replaceWindowLocation(response['slack_auth_url']);
      });
    },

    deleteSlackIntegration(slackIntegration) {
      const confirmationMessage = 'Are you sure you want delete this Slack integration?';
      if (!utils.confirmMessage(confirmationMessage)) {
        return;
      }
      slackIntegration.destroyRecord();
    },

    createNewIntegrationConfig(slackIntegration) {
      const newConfig = this.store.createRecord('slackIntegrationConfig', {
        slackIntegration: slackIntegration,
        notificationTypes: [],
      });
      this.set('newConfig', newConfig);
    },

    deleteSlackIntegrationConfig(slackIntegrationConfig) {
      const confirmationMessage =
        'Are you sure you want remove this project from this Slack integration?';
      if (!utils.confirmMessage(confirmationMessage)) {
        return;
      }
      slackIntegrationConfig.destroyRecord();
    },
  },
});
