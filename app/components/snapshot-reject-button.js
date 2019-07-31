import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {SNAPSHOT_REJECTED_STATE, SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';

export default Component.extend({
  tagName: '',
  snapshots: null,
  reviews: service(),
  isLoading: readOnly('_rejectSnapshot.isRunning'),

  actions: {
    rejectSnapshots() {
      this._rejectSnapshot.perform();
      // The time between when we get the response back from the server and the time
      // it takes Ember to process and render the returned data is actually quite long (~1s)
      // on production. So setting these properties here disguises that transition time and
      // prevents jank in the reject button state
      this.snapshots.forEach(snapshot => {
        snapshot.set('reviewState', SNAPSHOT_REJECTED_STATE);
        snapshot.set('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED);
      });
    },
  },

  _rejectSnapshot: task(function*() {
    return yield this.reviews.createRejectReview(this.snapshots[0].build, this.snapshots);
  }),
});
