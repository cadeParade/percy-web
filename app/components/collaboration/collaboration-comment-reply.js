import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  tagName: '',
  isExpanded: false,
  commentBody: '',
  commentThread: null,

  session: service(),
  currentUser: readOnly('session.currentUser'),

  actions: {
    expandReply() {
      this.set('isExpanded', true);
    },

    collapseReply() {
      this.set('isExpanded', false);
    },

    saveReply() {
      this.saveReply({
        commentBody: this.commentBody,
        commentThread: this.commentThread,
      });
    },
  },
});
