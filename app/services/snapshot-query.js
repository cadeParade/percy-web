import Service, {inject as service} from '@ember/service';
import {SNAPSHOT_REVIEW_STATE_REASONS, DIFF_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';

const SNAPSHOT_COMPARISON_INCLUDES = Object.freeze([
  'comparisons.head-screenshot.image',
  'comparisons.head-screenshot.lossy-image',
  'comparisons.base-screenshot.image',
  'comparisons.base-screenshot.lossy-image',
  'comparisons.diff-image',
  'comparisons.browser',
]);

export default Service.extend({
  store: service(),
  getUnchangedSnapshots(build) {
    return this.store.loadRecords('snapshot', {
      filter: {
        build: build.get('id'),
        'review-state-reason': SNAPSHOT_REVIEW_STATE_REASONS.NO_DIFFS,
      },
    });
  },

  getChangedSnapshots(build) {
    return this.store.loadRecords('snapshot', {
      filter: {
        build: build.get('id'),
        'review-state-reason': DIFF_REVIEW_STATE_REASONS.join(','),
      },
    });
  },

  getSnapshot(snapshotId) {
    return this.get('store').loadRecord('snapshot', snapshotId, {
      include: SNAPSHOT_COMPARISON_INCLUDES.join(','),
    });
  },

  getCommentsForSnapshot(snapshotId, buildId) {
    return this.store.loadRecords('commentThread', {
      filter: {
        build: buildId,
        snapshot_ids: [snapshotId],
      },
      include: 'comments,comments.author',
    });
  },
});
