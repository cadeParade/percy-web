import Component from '@ember/component';
import {gt, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  tagName: '',

  session: service(),
  currentUser: readOnly('session.currentUser'),

  commentThread: null,
  comments: readOnly('commentThread.comments'),
  areCommentsCollapsed: gt('comments.length', 3),
  numCollapsedComments: computed('comments.length', function() {
    return this.comments.length - 3;
  }),

  actions: {
    showCollapsedComments() {
      this.set('areCommentsCollapsed', false);
    },
  },
});
