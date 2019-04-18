import Component from '@ember/component';
import {get, set} from '@ember/object';

export default Component.extend({
  numTotalSnapshots: null,
  numUnapprovedSnapshots: null,
  isGroupApproved: false,
  isLoading: false,
  isDisabled: false,
  tagName: '',

  init() {
    this._super(...arguments);
    this.approvableSnapshots = this.approvableSnapshots || [];
  },

  actions: {
    async approveGroup() {
      set(this, 'isLoading', true);
      await get(this, 'createReview')(get(this, 'approvableSnapshots'), {
        title: 'Group Approved',
        properties: {
          build_id: get(this, 'approvableSnapshots.firstObject.build.id'),
        },
      });
      // The time between when we get the response back from the server and the time
      // it takes Ember to process and render the returned data is actually quite long (~1s)
      // on production. So setting these properties here disguises that transition time and
      // prevents jank in the Approve/Approved button state
      set(this, 'isGroupApproved', true);
      set(this, 'isLoading', false);
    },
  },
});
