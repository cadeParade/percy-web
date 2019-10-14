import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {isUserAdminOfOrg} from 'percy-web/lib/is-user-member-of-org';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  currentUser: readOnly('session.currentUser'),

  model() {
    const organization = this.modelFor('organizations.organization');
    let includes = 'user';
    if (isUserAdminOfOrg(this.currentUser, organization)) {
      includes = 'user.identities';
    }

    const organizationUsers = this.store.query('organization-user', {
      organization,
      include: includes,
    });
    const invites = this.store.query('invite', {organization});
    const orgWithSaml = this.store.findRecord('organization', organization.id, {
      include: 'saml-integration',
      reload: true,
    });

    return hash({
      organization: orgWithSaml,
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
