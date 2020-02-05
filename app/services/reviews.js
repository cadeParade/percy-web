import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import {REVIEW_ACTIONS} from 'percy-web/models/review';
import {task} from 'ember-concurrency';
import {get} from '@ember/object';

export default class ReviewsService extends Service {
  @service
  store;

  @service
  analytics;

  @service
  snapshotQuery;

  @service
  commentThreads;

  @service
  confirm;

  @task(function*({snapshots, build, eventData}) {
    const hasOpenReviewThreads = this._snapshotsHaveOpenReviewThreads(snapshots);
    const hasRejectedSnapshots = snapshots.any(snapshot => snapshot.isRejected);

    let shouldDisplayModal = false;
    shouldDisplayModal = hasRejectedSnapshots || hasOpenReviewThreads;

    if (shouldDisplayModal) {
      const reviewConfirmMessage = this._reviewConfirmMessage(snapshots);
      const result = yield this.confirm.ask({message: reviewConfirmMessage});

      return result ? yield this.createApprovalReview(build, snapshots, eventData) : false;
    } else {
      return yield this.createApprovalReview(build, snapshots, eventData);
    }
  })
  createReview;

  async createApprovalReview(build, snapshots, eventData) {
    const review = this.store.createRecord('review', {
      build,
      snapshots,
      action: REVIEW_ACTIONS.APPROVE,
    });
    return await this._saveReview(review, build, eventData);
  }

  async createRejectReview(build, snapshots, eventData) {
    const review = get(this, 'store').createRecord('review', {
      build,
      snapshots,
      action: REVIEW_ACTIONS.REJECT,
    });
    return await this._saveReview(review, build, eventData);
  }

  async _saveReview(review, build, eventData) {
    await review.save();
    const refreshedBuild = this.store.findRecord('build', build.get('id'), {
      reload: true,
      include: 'approved-by',
    });
    const refreshedSnapshots = this.snapshotQuery.getChangedSnapshots(build);
    const snapshotsComments = this.commentThreads.getCommentsForSnapshotIds(
      review.snapshots.mapBy('id'),
      build,
    );
    await Promise.all([refreshedBuild, refreshedSnapshots, snapshotsComments]);

    if (eventData && eventData.title) {
      this._trackEventData(eventData, build);
    }

    return true;
  }

  _openReviewThreads(snapshots) {
    return snapshots.filterBy('isApproved', false).reduce((acc, snapshot) => {
      return acc.concat(snapshot.commentThreads.filterBy('isResolvable')).toArray();
    }, []);
  }

  _snapshotsHaveOpenReviewThreads(snapshots) {
    return this._openReviewThreads(snapshots).length > 0;
  }

  _reviewConfirmMessage(snapshots) {
    const numSnapshotsToApprove = snapshots.length;
    const snapshotString = numSnapshotsToApprove > 1 ? 'snapshots' : 'snapshot';
    const possessionString = numSnapshotsToApprove > 1 ? 'have' : 'has';
    const directObjectString = numSnapshotsToApprove > 1 ? 'them' : 'it';

    return `The ${snapshotString} you want to approve ${possessionString} changes requested.
      Are you sure you want to approve ${directObjectString}?`;
  }

  _trackEventData(eventData, build) {
    get(this, 'analytics').track(
      eventData.title,
      build.get('project.organization'),
      eventData.properties,
    );
  }
}
