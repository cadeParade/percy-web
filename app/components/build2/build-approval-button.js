import {action} from '@ember/object';
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default class BuildApprovalButton extends Component {
  reviews = service();

  @action
  approveBuild() {
    const unapprovedSnapshots = this.build.snapshots.filterBy('isUnreviewed');
    this.reviews.createReview.perform({
      snapshots: unapprovedSnapshots,
      build: this.build,
    });
  }
}
