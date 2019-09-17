import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  intercom: service(),

  model() {
    const organization = this.modelFor('organizations.organization');
    return organization.samlIntegration;
  },

  setupController(controller, resolvedModel) {
    controller.setProperties({
      samlIntegration: resolvedModel,
      organization: resolvedModel.organization,
      currentUser: this.session.currentUser,
    });
  },

  actions: {
    showSupport() {
      const messageText = "Hi! I have an Okta integration that I'd like to update.";
      this.intercom.showIntercom('showNewMessage', messageText);
    },
  },
});
