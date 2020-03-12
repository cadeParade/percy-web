import {readOnly} from '@ember/object/computed';
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  flashMessages: service(),
  reviews: service(),
  build: null,
  approve: null,
  approvableSnapshots: null,
  isApproved: readOnly('build.isApproved'),
  isLoading: false,
  isDisabled: false,
  'aria-label': 'Approve this build',
  tagName: 'button',
  classNames: ['build-approval-button btn-success ml-1 flex items-center'],
  classNameBindings: ['isLoading:is-loading', 'isApproved:is-approved'],
  attributeBindings: ['aria-label', 'data-test-build-approval-button', 'isDisabled:disabled'],
  'data-test-build-approval-button': true,

  async click() {
    if (this.get('build.isApproved')) {
      this.flashMessages.info('This build was already approved');
      return;
    }

    if (this.get('approvableSnapshots.length') === 0) {
      return;
    }

    this.set('isLoading', true);
    await this.reviews.createReview.perform({
      snapshots: this.approvableSnapshots,
      build: this.build,
    });
    this.set('isLoading', false);
  },
});
