import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',
  flashMessages: service(),
  commentThreads: service(),
  comment: null,
  isFirstComment: false,
  isCommentingAllowed: true,

  commentThread: readOnly('comment.commentThread'),
  commentThreadSnapshot: readOnly('commentThread.snapshot'),
  author: readOnly('comment.author'),
  isClosed: readOnly('commentThread.isClosed'),
  isReview: readOnly('commentThread.isReview'),

  displayCreatedAt: computed('comment.createdAt', function() {
    return moment(this.comment.createdAt).fromNow();
  }),

  isOnOriginatingSnapshot: computed(
    'commentThread.originatingSnapshotId',
    'commentThreadSnapshot.id',
    function() {
      const threadSnapshot = this.commentThread.snapshot;
      const originatingSnapshotId = this.commentThread.originatingSnapshotId;
      if (threadSnapshot.id && originatingSnapshotId) {
        return originatingSnapshotId.toString() === threadSnapshot.id;
      } else {
        return false;
      }
    },
  ),

  actions: {
    async closeCommentThread() {
      const commentThread = this.comment.commentThread;
      const task = this.commentThreads.closeCommentThread.perform({commentThread});

      this.set('closeThreadTask', task);
      await task;

      if (!task.isSuccessful) {
        this.flashMessages.danger('Something went wrong while closing this comment.');
      }
    },
  },
});
