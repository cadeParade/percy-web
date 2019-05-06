import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),

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
      slackIntegration
        .destroyRecord()
        .then(() => {
          this.get('flashMessages').success(
            `Successfully deleted your ${slackIntegration.channelName} Slack integration`,
          );
        })
        .catch(() => {
          this.get('flashMessages').danger(
            'There was a problem deleting this integration.' +
              ' Please try again or contact customer support.',
          );
        });
    },
  },
});
