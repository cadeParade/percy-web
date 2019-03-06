import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    const organization = this.modelFor('organizations.organization');
    const organizationUsers = this.store.query('organization-user', {organization});
    const invites = this.store.query('invite', {organization});

    return hash({
      organization,
      organizationUsers,
      invites,
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      organizationUsers: model.organizationUsers,
      organization: model.organization,
      invites: model.invites,
    });
  },
});
