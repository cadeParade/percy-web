import Component from '@ember/component';
import {get, set} from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  reviews: service(),
  numTotalSnapshots: null,
  numUnapprovedSnapshots: null,
  isGroupApproved: false,
  isDisabled: false,
  tagName: '',
  isLoading: false,

  init() {
    this._super(...arguments);
    this.approvableSnapshots = this.approvableSnapshots || [];
  },

  actions: {
    async approveGroup() {
      const eventData = {
        title: 'Group Approved',
        properties: {
          build_id: get(this, 'approvableSnapshots.firstObject.build.id'),
        },
      };

      this.set('isLoading', true);
      const areSnapshotsApproved = await this.reviews.createReview.perform({
        snapshots: this.approvableSnapshots,
        build: this.approvableSnapshots.firstObject.build,
        eventData,
      });

      this.set('isLoading', false);

      if (areSnapshotsApproved) {
        // The time between when we get the response back from the server and the time
        // it takes Ember to process and render the returned data is actually quite long (~1s)
        // on production. So setting these properties here disguises that transition time and
        // prevents jank in the Approve/Approved button state
        set(this, 'isGroupApproved', true);
      }
    },
  },
});
