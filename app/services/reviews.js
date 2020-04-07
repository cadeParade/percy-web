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
    const refreshedBuild = this._refreshBuild(build);
    const refreshedSnapshots = this._refreshSnapshots(review);
    const refreshedComments = this._refreshComments(review);

    await Promise.all([refreshedBuild, refreshedSnapshots, refreshedComments]);

    if (eventData && eventData.title) {
      this._trackEventData(eventData, build);
    }

    return true;
  }

  _refreshComments(review) {
    this.commentThreads.getCommentsForSnapshotIds(review.snapshots.mapBy('id'), review.build);
  }

  _refreshBuild(build) {
    return this.store.findRecord('build', build.get('id'), {
      reload: true,
      include: 'approved-by',
    });
  }

  _refreshSnapshots(review) {
    // If snapshots were included in the review (aka not a build approval)
    // AND
    // there are less than some arbitrary number (30) load the individual snapshots.
    // We don't load _all_ snapshots always because if a person approves say 1000 snapshots at once,
    // the API throws an error that the request is too many characters.
    if (review.snapshots.length > 0 && review.snapshots.length < 30) {
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
    // Snapshots already in the store
    const loadedSnapshots = this._loadedSnapshotsForBuild(build);
    let anyUnloadedSnapshotsAreRejected = false;
    const sortMetadata = build.get('sortMetadata');

    // If you go directly to a fullscreen snapshot and click "approve", it will not have
    // build sort metadata. Therefore, do not check unloaded snapshots.
    if (sortMetadata && sortMetadata.anyUnloadedSnapshotItemsRejected) {
      anyUnloadedSnapshotsAreRejected = sortMetadata.anyUnloadedSnapshotItemsRejected;
    }
    const anyLoadedSnapshotsAreRejected = loadedSnapshots.any(snapshot => snapshot.isRejected);
    return anyLoadedSnapshotsAreRejected || anyUnloadedSnapshotsAreRejected;
  }

  _loadedSnapshotsForBuild(build) {
    return this.store
      .peekAll('snapshot')
      .filterBy('build.id', build.get('id'))
      .filterBy('isChanged');
  }

  _reviewConfirmMessage(snapshots) {
    // If it is a build approval, there might not be snapshots, so snapshots.length will be 0.
    // 1 is a sane default for this case.
    const numSnapshotsToApprove = (snapshots && snapshots.length) || 1;
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
