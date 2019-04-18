import $ from 'jquery';
import {run} from '@ember/runloop';
import Component from '@ember/component';
import utils from '../lib/utils';

export default Component.extend({
  user: null,
  requestSent: false,

  actions: {
    createPasswordChangeRequest() {
      this.set('isLoading', true);

      $.ajax({
        type: 'POST',
        url: utils.buildApiUrl('passwordChangeRequest', this.get('user.emailPasswordIdentity.id')),
      })
        .then(() => {
          // Make sure Ember runloop knows about the ajax situation.
          run(() => {
            this.set('requestSent', true);
          });
        })
        .always(() => {
          this.set('isLoading', false);
        });
    },
  },
});
