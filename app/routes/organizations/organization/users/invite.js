import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    const organization = this.modelFor('organizations.organization');
    const invites = this.store.query('invite', {organization});

    return hash({
      organization,
      invites,
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      invites: model.invites,
    });
  },
});
