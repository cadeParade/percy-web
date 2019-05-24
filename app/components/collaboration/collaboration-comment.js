import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import moment from 'moment';

export default Component.extend({
  tagName: '',
  comment: null,
  isFirstComment: false,

  commentThread: readOnly('comment.commentThread'),
  author: readOnly('comment.author'),
  isClosed: readOnly('commentThread.isClosed'),
  isReview: readOnly('commentThread.isReview'),

  displayCreatedAt: computed('comment.createdAt', function() {
    return moment(this.comment.createdAt).fromNow();
  }),

  actions: {
    closeCommentThread() {
      this.closeCommentThread(this.comment.commentThread);
    },
  },
});
