import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  tagName: '',
  isExpanded: false,
  commentBody: '',
  commentThread: null,
  createComment: null,

  session: service(),
  flashMessages: service(),
  currentUser: readOnly('session.currentUser'),
  isCommentSaving: readOnly('commentSaveTask.isRunning'),

  actions: {
    expandReply() {
      this.set('isExpanded', true);
    },

    collapseReply() {
      this.set('isExpanded', false);
    },

    async saveReply() {
      const commentBody = this.commentBody;
      const task = this.createComment({
        commentBody: commentBody,
        commentThread: this.commentThread,
      });

      this.set('commentSaveTask', task);
      await task;

      if (task.isSuccessful) {
        this.set('isExpanded', false);
        this.set('commentBody', '');
      } else {
        this.set('isExpanded', true);
        this.set('commentBody', commentBody);
        this.flashMessages.danger('Something went wrong with saving your comment.');
      }
    },
  },
});
