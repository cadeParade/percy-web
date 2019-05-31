import Component from '@ember/component';
import {notEmpty, readOnly, sort} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',

  session: service(),
  currentUser: readOnly('session.currentUser'),

  // Set by init.
  commentThreads: null,

  orderedCommentThreads: sort('commentThreads', function(a, b) {
    const aEpochDate = a.createdAt.valueOf();
    const bEpochDate = b.createdAt.valueOf();
    if (aEpochDate < bEpochDate) {
      return 1;
    } else if (bEpochDate < aEpochDate) {
      return -1;
    } else {
      return 0;
    }
  }),

  hasCommentThreads: notEmpty('commentThreads'),

  init() {
    this._super(...arguments);
    this.commentThreads = this.commentThreads || [];
  },
});
