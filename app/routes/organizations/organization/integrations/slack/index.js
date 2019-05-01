import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('organizations.organization');
  },

  setupController(controller, model) {
    controller.set('organization', model);
  },

  actions: {
    deleteSlackIntegration(slackIntegration) {
      const confirmationMessage = 'Are you sure you want delete this Slack integration?';
      if (!utils.confirmMessage(confirmationMessage)) {
        return;
      }
      slackIntegration.destroyRecord();
    },
  },
});
