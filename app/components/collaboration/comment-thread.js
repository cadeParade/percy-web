import Component from '@ember/component';
import {and, filterBy, gt, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  tagName: '',
  isCommentingAllowed: true,

  session: service(),
  currentUser: readOnly('session.currentUser'),

  commentThread: null,
  comments: readOnly('commentThread.comments'),
  filteredComments: filterBy('comments', 'isSaving', false),
  shouldShowThreadReplyInput: and('commentThread.isOpen', 'isCommentingAllowed'),

  areCommentsCollapsed: gt('comments.length', 3),
  numCollapsedComments: computed('comments.length', function() {
    return this.comments.length - 3;
  }),

  firstComment: readOnly('filteredComments.firstObject'),
  secondComment: computed('filteredComments.[]', function() {
    return this.filteredComments.objectAt(1);
  }),
  lastComment: computed('filteredComments.[]', function() {
    return this.filteredComments.objectAt(this.filteredComments.length - 1);
  }),

  actions: {
    showCollapsedComments() {
      this.set('areCommentsCollapsed', false);
    },
  },
});
