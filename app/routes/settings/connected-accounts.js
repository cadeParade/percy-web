import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import {hash} from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  flashMessages: service(),
  currentUser: alias('session.currentUser'),

  model() {
    // We need the user's orgs to know if any of them have forced SSO.
    const orgPromises = Promise.all(
      this.currentUser.organizationUsers.map(orgUser => {
        const orgId = orgUser.belongsTo('organization').id();
        return this.store.loadRecord('organization', orgId, {include: 'saml-integration'});
      }),
    );
    return hash({
      orgs: orgPromises,
      identities: this.currentUser.identities,
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      identities: model.identities,
      allowEditingAccounts: !this._anyOrgsHaveForceSso(model.orgs),
    });
  },

  _anyOrgsHaveForceSso(orgs) {
    return orgs.any(org => org.samlIntegration && org.samlIntegration.forceSso);
  },
});
