import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {readOnly} from '@ember/object/computed';
import {isEmpty} from '@ember/utils';
import {computed, get} from '@ember/object';

export default Component.extend({
  mentionables: service(),
  commentThreads: service(),
  tagName: '',
  isExpanded: false,
  commentBody: '',
  commentThread: null,
  mentionedUsers: null,

  session: service(),
  flashMessages: service(),
  currentUser: readOnly('session.currentUser'),
  isCommentSaving: readOnly('commentSaveTask.isRunning'),

  // Setup @mentions and emoji
  tributeConfigs: computed(function () {
    const org = get(this, 'commentThread.snapshot.build.project.organization');
    return [this.mentionables.generateOrgUserConfig(org), this.mentionables.generateEmojiConfig()];
  }),

  actions: {
    expandReply() {
      this.set('isExpanded', true);
    },

    collapseReply() {
      this.set('isExpanded', false);
    },

    handleAtMentionUser(user) {
      this.mentionedUsers.pushObject(user);
    },

    async saveReply() {
      if (isEmpty(this.commentBody)) return;
      const commentBody = this.commentBody;

      const task = this.commentThreads.createComment.perform({
        commentThread: this.commentThread,
        commentBody: commentBody,
        mentionedUsers: this.mentionables.verifyMentions(this.mentionedUsers, this.commentBody),
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

  init() {
    this._super(...arguments);
    this.mentionedUsers = this.mentionedUsers || [];
  },
});
