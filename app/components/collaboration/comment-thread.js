import Component from '@ember/component';
import {and, filterBy, gt, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  tagName: '',
  isCommentingAllowed: true,
  userAreCommentsCollapsed: undefined,

  session: service(),
  currentUser: readOnly('session.currentUser'),

  commentThread: null,
  comments: readOnly('commentThread.comments'),
  filteredComments: filterBy('comments', 'isSaving', false),
  shouldShowThreadReplyInput: and('commentThread.isOpen', 'isCommentingAllowed'),

  _defaultAreCommentsCollapsed: gt('comments.length', 3),
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

  areCommentsCollapsed: computed(
    '_defaultAreCommentsCollapsed',
    'userAreCommentsCollapsed',
    function() {
      if (this.userAreCommentsCollapsed !== undefined) {
        return this.userAreCommentsCollapsed;
      } else {
        return this._defaultAreCommentsCollapsed;
      }
    },
  ),

  actions: {
    showCollapsedComments() {
      if (this.userAreCommentsCollapsed === undefined) {
        this.set('userAreCommentsCollapsed', false);
      } else {
        this.set('userAreCommentsCollapsed', !this.userAreCommentsCollapsed);
      }
    },
  },
});
