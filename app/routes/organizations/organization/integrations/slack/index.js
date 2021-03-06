import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';
import {hash} from 'rsvp';

// Remove @classic when we can refactor away from mixins
@classic
export default class IndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  flashMessages;

  model() {
    const organization = this.modelFor('organizations.organization');

    return hash({
      organization: organization.sideload('slack-integrations.slack-integration-configs'),
    });
  }

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      isAdmin: model.organization.currentUserIsAdmin,
    });
  }

  @action
  deleteSlackIntegration(slackIntegration) {
    const confirmationMessage = 'Are you sure you want delete this Slack integration?';
    if (!utils.confirmMessage(confirmationMessage)) {
      return;
    }
    slackIntegration
      .destroyRecord()
      .then(() => {
        this.flashMessages.success(
          `Successfully deleted your ${slackIntegration.channelName} Slack integration`,
        );
      })
      .catch(() => {
        this.flashMessages.danger(
          'There was a problem deleting this integration.' +
            ' Please try again or contact customer support.',
        );
      });
  }
}
