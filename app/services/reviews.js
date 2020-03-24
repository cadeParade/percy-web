import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import {REVIEW_ACTIONS} from 'percy-web/models/review';
import {SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';
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

  @service
  launchDarkly;

  @task(function* ({snapshots, build, eventData}) {
    const hasOpenReviewThreads = this._snapshotsHaveOpenReviewThreads(snapshots);
    const hasRejectedSnapshots = this._snapshotsAreRejected(snapshots, build);

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
    const reviewData = {build, action: REVIEW_ACTIONS.APPROVE};
    if (snapshots) {
      reviewData.snapshots = snapshots;
    }

    const review = this.store.createRecord('review', reviewData);
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
    const refreshedSnapshots = this._refreshSnapshots(review);
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

  _refreshSnapshots(review) {
    if (review.snapshots.length > 0) {
      return this.snapshotQuery.getSnapshots(review.snapshots.mapBy('id'), review.build.get('id'));
    } else {
      return this.snapshotQuery.getChangedSnapshots(review.build);
    }
  }

  _openReviewThreads(snapshots) {
    return snapshots.filterBy('isApproved', false).reduce((acc, snapshot) => {
      return acc.concat(snapshot.commentThreads.filterBy('isResolvable')).toArray();
    }, []);
  }

  _snapshotsHaveOpenReviewThreads(snapshots) {
    if (!snapshots) return false;
    return this._openReviewThreads(snapshots).length > 0;
  }

  _snapshotsAreRejected(snapshots, build) {
    if (!snapshots && this.launchDarkly.variation('snapshot-sort-api')) {
      const loadedSnapshots = this._loadedSnapshotsForBuild(build);
      const loadedSnapshotIds = loadedSnapshots.mapBy('id');
      const anyLoadedSnapshotsAreRejected = loadedSnapshots.any(snapshot => snapshot.isRejected);
      const snapshotData = build.sortMetadata.allOrderItemsById;
      loadedSnapshotIds.forEach(id => {
        delete snapshotData[id];
      });

      const anyUnloadedSnapshotsAreRejected = this._anyUnloadedSnapshotsAreRejected(snapshotData);
      return anyLoadedSnapshotsAreRejected || anyUnloadedSnapshotsAreRejected;
    } else if (snapshots) {
      return snapshots.any(snapshot => snapshot.isRejected);
    } else {
      return false;
    }
  }

  _anyUnloadedSnapshotsAreRejected(snapshotSortItems) {
    return Object.values(snapshotSortItems).any(item => {
      const reviewState = item.attributes['review-state-reason'];
      const isRejected = reviewState === SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED;
      const isRejectedPreviously =
        reviewState === SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED_PREVIOUSLY;
      return isRejected || isRejectedPreviously;
    });
  }

  _loadedSnapshotsForBuild(build) {
    return this.store
      .peekAll('snapshot')
      .filterBy('build.id', build.get('id'))
      .filterBy('isChanged');
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
