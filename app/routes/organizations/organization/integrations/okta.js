import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class OktaRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @service
  intercom;

  model() {
    const organization = this.modelFor('organizations.organization');
    return organization.samlIntegration;
  }

  setupController(controller, resolvedModel) {
    controller.setProperties({
      samlIntegration: resolvedModel,
      organization: resolvedModel.organization,
      currentUser: this.session.currentUser,
    });
  }

  @action
  showSupport() {
    const messageText = "Hi! I have an Okta integration that I'd like to update.";
    this.intercom.showIntercom('showNewMessage', messageText);
  }
}
