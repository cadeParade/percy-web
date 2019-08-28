import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  intercom: service(),
  session: service(),
  currentUser: alias('session.currentUser'),

  afterModel(model) {
    this.intercom.associateWithCompany(this.currentUser, model);

    // Proactively load the currentUserMembership object and return to block rendering until it
    // exists, since we use it to determine what parts of the organization settings the current
    // user has permission to access. Loading it now prevents flickering.
    //
    // Note: we have to use the underlying _filteredOrganizationUsers because it is a promise,
    // whereas currentUserMembership is just an alias to .firstObject.
    return model.get('_filteredOrganizationUsers');
  },
  actions: {},
});
