import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',
  flashMessages: service(),
  comment: null,
  isFirstComment: false,
  isCommentingAllowed: true,
  closeCommentThread() {},

  commentThread: readOnly('comment.commentThread'),
  author: readOnly('comment.author'),
  isClosed: readOnly('commentThread.isClosed'),
  isReview: readOnly('commentThread.isReview'),

  displayCreatedAt: computed('comment.createdAt', function() {
    return moment(this.comment.createdAt).fromNow();
  }),

  actions: {
    async closeCommentThread() {
      const commentThread = this.comment.commentThread;
      const task = this.closeCommentThread({commentThread});

      this.set('closeThreadTask', task);
      await task;

      if (!task.isSuccessful) {
        this.flashMessages.danger('Something went wrong while closing this comment.');
      }
    },
  },
});
