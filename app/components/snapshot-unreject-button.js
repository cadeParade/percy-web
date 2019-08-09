import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  snapshots: null,
  reviews: service(),
  isLoading: readOnly('_unrejectSnapshot.isRunning'),

  actions: {
    unreviewSnapshots() {
      this._unrejectSnapshot.perform();
    },
  },

  _unrejectSnapshot: task(function*() {
    return yield this.reviews.createUnreviewReview(this.snapshots[0].build, this.snapshots);
  }),
});
