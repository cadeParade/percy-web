import Component from '@ember/component';
import {notEmpty, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',

  session: service(),
  currentUser: readOnly('session.currentUser'),

  // Set by init.
  commentThreads: null,

  hasCommentThreads: notEmpty('commentThreads'),

  init() {
    this._super(...arguments);
    this.commentThreads = this.commentThreads || [];
  },
});
