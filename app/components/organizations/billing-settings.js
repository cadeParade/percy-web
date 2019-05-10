import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  flashMessages: service(),
  organization: null,
  subscription: readOnly('organization.subscription'),

  actions: {
    showEmailEdit() {
      this.set('isEmailEditShowing', true);
    },

    hideEmailEdit() {
      this.set('isEmailEditShowing', false);
    },

    afterEmailUpdate() {
      this.set('isEmailEditShowing', false);
      this.flashMessages.success('Your billing email has been updated.');
    },

    showCardEdit() {
      this.set('isCardEditShowing', true);
    },

    hideCardEdit() {
      this.set('isCardEditShowing', false);
    },
  },
});
