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

  @task(function* ({snapshots, build, eventData}) {
    // TODO(sort) Update _loadedSnapshotsForBuild,
    // createApprovalReview to not include snapshots,
    // openReviewThread, rejectedComments
    // to check sort metadata rather than snapshots in store.
    if (!snapshots) {
      snapshots = this._loadedSnapshotsForBuild(build);
    }

    const hasOpenReviewThreads = this._snapshotsHaveOpenReviewThreads(snapshots);
    const hasRejectedSnapshots = this._snapshotsHaveRejectedComments(snapshots);

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
    // TODO(sort) how to create records without full models :(
    const fakeSnapshots = snapshots.map(snapshot => {
      const isString = typeof snapshot === 'string';
      const isNumber = typeof snapshot === 'number';

      if (isString || isNumber) {
        const record = this.store.peekRecord('snapshot', snapshot);
        if (!record) {
          return this.store.createRecord('snapshot', {id: snapshot});
        } else {
          return record;
        }
      } else {
        return snapshot;
      }
    });

    const review = this.store.createRecord('review', {
      build,
      snapshots: fakeSnapshots,
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
    const refreshedSnapshots = this.snapshotQuery.getSnapshots(
      review.snapshots.mapBy('id'),
      build.get('id'),
    );
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

  _snapshotsHaveRejectedComments(snapshots) {
    return snapshots.any(snapshot => snapshot.isRejected);
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
