import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  store: service(),
  isAdmin: readOnly('organization.currentUserIsAdmin'),
  orgInvites: readOnly('organization.invites'),
  invites: computed('orgInvites.@each.id', function () {
    return this.store
      .peekAll('invite')
      .filterBy('organization.id', this.get('organization.id'))
      .filter(invite => {
        return !!invite.get('email');
      });
  }),
});
