import Component from '@ember/component';
import {computed} from '@ember/object';
import {filterBy, notEmpty, readOnly, sort} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',

  session: service(),
  currentUser: readOnly('session.currentUser'),

  commentThreads: null, // Set by init.
  isCommentingAllowed: true,
  snapshot: null,
  areClosedThreadsExpanded: false,

  hasCommentThreads: notEmpty('commentThreads'),

  _dateOrderedCommentThreads: sort('commentThreads', commentThreadDateSort),
  openThreads: filterBy('_dateOrderedCommentThreads', 'isOpen'),
  closedThreads: filterBy('_dateOrderedCommentThreads', 'isClosed'),
  hasClosedThreads: notEmpty('closedThreads'),

  areCommentsLoading: computed('snapshot.totalOpenComments', 'commentThreads.[]', function() {
    const numCachedComments = parseInt(this.snapshot.totalOpenComments);
    const numLoadedComments = this.commentThreads.reduce((acc, thread) => {
      acc += thread.comments.length;
      return acc;
    }, 0);
    return numCachedComments > numLoadedComments;
  }),

  actions: {
    showClosedComments() {
      this.set('areClosedThreadsExpanded', true);
    },
  },

  init() {
    this._super(...arguments);
    this.commentThreads = this.commentThreads || [];
  },
});

function commentThreadDateSort(a, b) {
  // convert these dates to epoch time for easier sorting.
  const aEpochDate = a.createdAt.valueOf();
  const bEpochDate = b.createdAt.valueOf();

  return aEpochDate < bEpochDate ? 1 : -1;
}
