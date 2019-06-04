import Component from '@ember/component';
import {notEmpty, readOnly, sort} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  tagName: '',

  session: service(),
  currentUser: readOnly('session.currentUser'),

  commentThreads: null, // Set by init.
  isCommentingAllowed: true,
  snapshot: null,

  _dateOrderedCommentThreads: sort('commentThreads', commentThreadDateSort),
  orderedCommentThreads: computed('_dateOrderedCommentThreads.@each.isOpen', function() {
    const openThreads = this._dateOrderedCommentThreads.filterBy('isOpen');
    const closedThreads = this._dateOrderedCommentThreads.rejectBy('isOpen');
    return openThreads.concat(closedThreads);
  }),

  hasCommentThreads: notEmpty('commentThreads'),

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
