import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import {computed, get} from '@ember/object';

export default Component.extend({
  mentionables: service(),
  flashMessages: service(),
  tagName: '',
  shouldShowNewCommentInput: false,
  currentUser: null,
  areChangesRequested: false,
  commentBody: '',
  createCommentThread: null,
  snapshot: null,
  mentionedUsers: null,
  isThreadSaving: readOnly('threadSaveTask.isRunning'),
  isRequestChangesDisabled: readOnly('snapshot.isApproved'),

  _resetForm() {
    this.set('shouldShowNewCommentInput', false);
    this.set('commentBody', '');
    this.set('areChangesRequested', false);
  },

  // Setup @mentions and emoji
  tributeConfigs: computed(function() {
    const org = get(this, 'snapshot.build.project.organization');
    return [this.mentionables.generateOrgUserConfig(org), this.mentionables.generateEmojiConfig()];
  }),

  actions: {
    toggleShouldShowNewCommentInput() {
      this.toggleProperty('shouldShowNewCommentInput');
    },

    handleAtMentionUser(user) {
      this.mentionedUsers.pushObject(user);
    },

    async saveComment() {
      if (isEmpty(this.commentBody)) return;
      const task = this.createCommentThread({
        commentBody: this.commentBody,
        areChangesRequested: this.areChangesRequested,
        snapshotId: this.snapshot.id,
        mentionedUsers: this.mentionables.verifyMentions(this.mentionedUsers, this.commentBody),
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

  init() {
    this._super(...arguments);
    this.mentionedUsers = this.mentionedUsers || [];
  },
});
