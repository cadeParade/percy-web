import {readOnly} from '@ember/object/computed';
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  reviews: service(),
  isLoading: readOnly('reviews.createReview.isRunning'),
  'aria-label': 'Approve this build',
  tagName: 'button',
  classNames: ['btn btn-success w-full'],
  classNameBindings: ['isLoading:is-loading', 'isApproved:is-approved'],
  attributeBindings: ['aria-label', 'isDisabled:disabled'],

  click() {
    const unapprovedSnapshots = this.build.snapshots.filterBy('isUnreviewed');
    this.reviews.createReview.perform({
      snapshots: unapprovedSnapshots,
      build: this.build,
    });
  },
});
