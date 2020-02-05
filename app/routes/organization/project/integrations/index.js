import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import utils from 'percy-web/lib/utils';

// Remove @classic when we can refactor away from mixins
@classic
export default class IndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  flashMessages;

  @service
  intercom;

  model() {
    const organization = this.store.loadRecord('organization', this.modelFor('organization').id, {
      include: 'version-control-integrations',
    });
    const project = this.modelFor('organization.project');
    const webhookConfigs = project.get('webhookConfigs');

    return hash({organization, project, webhookConfigs});
  }

  setupController(controller, model) {
    controller.setProperties({
      project: model.project,
      webhookConfigs: model.webhookConfigs,
      isUserOrgAdmin: model.project.organization.currentUserIsAdmin,
    });
  }

  @action
  deleteWebhookConfig(webhookConfig, confirmationMessage) {
    if (confirmationMessage && !utils.confirmMessage(confirmationMessage)) {
      return;
    }

    return webhookConfig.destroyRecord().then(() => {
      this.flashMessages.success('Successfully deleted webhook');
      this.refresh();
    });
  }

  _errorsWithDetails(errors) {
    return errors.filter(error => {
      return !!error.detail;
    });
  }

  _callAnalytics(actionName, extraProps) {
    const organization = this.get('project.organization');
    const props = {
      project_id: this.get('project.id'),
    };
    const allProps = Object.assign({}, extraProps, props);
    this.analytics.track(actionName, organization, allProps);
  }
}
