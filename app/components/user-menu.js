import Component from '@ember/component';
import {readOnly, or} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Component.extend({
  store: service(),
  session: service(),

  attributeBindings: ['data-test-user-menu'],
  'data-test-user-menu': true,

  currentUser: readOnly('session.currentUser'),
  orgsToDisplay: or('_refreshedUserOrgs', '_loadedUserOrgs'),

  _loadedUserOrgs: readOnly('currentUser.organizations'),
  _refreshedUserOrgs: null,
  _getUserOrganizations: task(function* () {
    const user = yield this.session.forceReloadUser();
    const _refreshedUserOrgs = yield this.store.query('organization', {user});
    this.setProperties({_refreshedUserOrgs});
  }),

  actions: {
    loadOrgs(isDropdownOpen) {
      if (isDropdownOpen) {
        this._getUserOrganizations.perform();
      }
    },
    logout() {
      this.session.invalidateAndLogout();
    },
  },
});
