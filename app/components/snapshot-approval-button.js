import Component from '@ember/component';
import {alias} from '@ember/object/computed';
import {SNAPSHOT_APPROVED_STATE, SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';
import {inject as service} from '@ember/service';

export default Component.extend({
  reviews: service(),
  isApproved: alias('snapshot.isApproved'),
  isLoading: false,
  isDisabled: false,
  tagName: '',

  actions: {
    async approveSnapshot() {
      this.set('isLoading', true);

      const areSnapshotsApproved = await this.reviews.createReview.perform({
        snapshots: [this.snapshot],
        build: this.snapshot.build,
      });
      if (areSnapshotsApproved) {
        // The time between when we get the response back from the server and the time
        // it takes Ember to process and render the returned data is actually quite long (~1s)
        // on production. So setting these properties here disguises that transition time and
        // prevents jank in the Approve/Approved button state
        this.set('snapshot.reviewState', SNAPSHOT_APPROVED_STATE);
        this.set('snapshot.reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED);
      }

      this.set('isLoading', false);
    },
  },
});
