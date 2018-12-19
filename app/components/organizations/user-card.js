import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import Component from '@ember/component';
import utils from 'percy-web/lib/utils';

export default Component.extend({
  tagName: '',
  organizationUser: null,
  session: service(),

  currentUser: readOnly('session.currentUser'),
  role: readOnly('organizationUser.role'),
  roleTitle: readOnly('organizationUser.roleTitle'),
  isAdmin: readOnly('organizationUser.organization.currentUserIsAdmin'),

  deleteNameText: computed(function() {
    if (this.get('isCurrentUser')) {
      return 'yourself';
    } else {
      return this.get('organizationUser.user.name');
    }
  }),
  isCurrentUser: computed('currentUser.id', 'organizationUser.user.id', function() {
    return this.get('currentUser.id') === this.get('organizationUser.user.id');
  }),

  actions: {
    removeUser() {
      const name = this.get('deleteNameText');
      const organizationName = this.get('organizationUser.organization.name');
      const confirmationMessage = `Are you sure you want to remove ${name} from
        the ${organizationName} organization?`;
      if (!utils.confirmMessage(confirmationMessage)) {
        return;
      }
      this.get('organizationUser').destroyRecord();
    },
    setRole(value) {
      const organizationUser = this.get('organizationUser');
      organizationUser.set('role', value);
      organizationUser.save();
    },
  },
});
