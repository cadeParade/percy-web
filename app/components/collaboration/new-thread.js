import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  flashMessages: service(),
  tagName: '',
  shouldShowNewCommentInput: false,
  currentUser: null,
  areChangesRequested: false,
  commentBody: '',
  createCommentThread: null,
  snapshot: null,
  isThreadSaving: readOnly('threadSaveTask.isRunning'),
  isRequestChangesDisabled: readOnly('snapshot.isApproved'),

  _resetForm() {
    this.set('shouldShowNewCommentInput', false);
    this.set('commentBody', '');
    this.set('areChangesRequested', false);
  },

  actions: {
    toggleShouldShowNewCommentInput() {
      this.toggleProperty('shouldShowNewCommentInput');
    },

    async saveComment() {
      const task = this.createCommentThread({
        commentBody: this.commentBody,
        areChangesRequested: this.areChangesRequested,
        snapshotId: this.snapshot.id,
      });

      this.set('threadSaveTask', task);
      await task;

      if (task.isSuccessful) {
        this._resetForm();
      } else {
        this.flashMessages.danger('Something went wrong with saving your comment.');
      }
    },
  },
});
