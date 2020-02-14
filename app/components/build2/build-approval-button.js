import {action} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default class BuildApprovalButton extends Component {
  @service
  reviews;

  @readOnly('reviews.createReview.isRunning')
  isLoading;

  @action
  approveBuild() {
    const unapprovedSnapshots = this.build.snapshots.filterBy('isUnreviewed');
    this.reviews.createReview.perform({
      snapshots: unapprovedSnapshots,
      build: this.build,
    });
  }
}
