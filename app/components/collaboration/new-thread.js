import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  shouldShowNewCommentInput: false,
  currentUser: null,
  areChangesRequested: false,
  commentBody: '',

  actions: {
    toggleShouldShowNewCommentInput() {
      this.toggleProperty('shouldShowNewCommentInput');
    },

    saveComment() {
      this.saveNewComment({
        author: this.currentUser,
        commentBody: this.commentBody,
        areChangesRequested: this.areChangesRequested,
      });
    },
  },
});
