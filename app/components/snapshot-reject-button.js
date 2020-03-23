import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  snapshots: null,
  reviews: service(),
  isLoading: readOnly('_rejectSnapshot.isRunning'),

  actions: {
    rejectSnapshots() {
      this._rejectSnapshot.perform();
    },
  },

  _rejectSnapshot: task(function* () {
    return yield this.reviews.createRejectReview(this.snapshots[0].build, this.snapshots);
  }),
});
