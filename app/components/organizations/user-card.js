import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import Component from '@ember/component';
import utils from 'percy-web/lib/utils';

export default Component.extend({
  router: service(),
  session: service(),

  isViewerAdmin: null,
  organizationUser: null,
  tagName: '',

  currentUser: readOnly('session.currentUser'),
  role: readOnly('organizationUser.role'),
  roleTitle: readOnly('organizationUser.roleTitle'),
  samlIntegration: readOnly('organizationUser.organization.samlIntegration'),

  deleteNameText: computed(function() {
    if (this.isCurrentUser) {
      return 'yourself';
    } else {
      return this.organizationUser.user.name;
    }
  }),
  isCurrentUser: computed('currentUser.id', 'organizationUser.user.id', function() {
    return this.currentUser.id === this.organizationUser.user.id;
  }),
  _user: readOnly('organizationUser.user'),
  orderedIdentities: computed('user.identities.[]', function() {
    const identities = this._user.identities.toArray();

    return [
      ...identities.filter(i => i.isSamlIdentity),
      ...identities.filter(i => i.isGithubIdentity),
      ...identities.filter(i => i.isAuth0Identity),
    ];
  }),

  userHasSamlIdentity: computed('orderedIdentities.@each.isSamlIdentity', function() {
    return this.orderedIdentities.some(identity => {
      return identity.isSamlIdentity;
    });
  }),

  isRemoveDisabled: computed('isViewerAdmin', 'userHasSamlIdentity', function() {
    const isOrgForceSso = this.samlIntegration && this.samlIntegration.forceSso;
    return isOrgForceSso || !this.isViewerAdmin;
  }),

  actions: {
    removeUser() {
      const name = this.deleteNameText;
      const organizationName = this.get('organizationUser.organization.name');
      const confirmationMessage = `Are you sure you want to remove ${name} from
        the ${organizationName} organization?`;
      if (!utils.confirmMessage(confirmationMessage)) {
        return;
      }
      this.organizationUser.destroyRecord();
      if (this.isCurrentUser) {
        this.router.transitionTo('default-org');
      }
    },
    setRole(value) {
      const organizationUser = this.organizationUser;
      organizationUser.set('role', value);
      organizationUser.save();
    },
  },
});
