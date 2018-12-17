import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    const organization = this.modelFor('organizations.organization');
    return hash({
      organization,
      organizationUsers: this.store.query('organization-user', {organization}),
      invites: this.store.query('invite', {organization}),
    });
  },

  setupController(controller, resolvedModel) {
    controller.setProperties({
      organizationUsers: resolvedModel.organizationUsers,
      organization: resolvedModel.organization,
      invites: resolvedModel.invites,
    });
  },
});
