import Service, {inject as service} from '@ember/service';
import {SNAPSHOT_REVIEW_STATE_REASONS, DIFF_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';
import {get} from '@ember/object';

export const SNAPSHOT_PAGINATION_COUNT = 10;

export const SNAPSHOT_COMPARISON_INCLUDES = Object.freeze([
  'comparisons.head-screenshot.image',
  'comparisons.head-screenshot.lossy-image',
  'comparisons.base-screenshot.image',
  'comparisons.base-screenshot.lossy-image',
  'comparisons.diff-image',
  'comparisons.browser',
]);

export default class SnapshotQueryService extends Service {
  @service
  store;

  getUnchangedSnapshots(build) {
    return this.store.loadRecords('snapshot', {
      build_id: build.get('id'),
      filter: {
        'review-state-reason': SNAPSHOT_REVIEW_STATE_REASONS.NO_DIFFS,
      },
    });
  }

  getChangedSnapshots(build) {
    const isBuildId = typeof build === 'number' || typeof build === 'string';
    const buildId = isBuildId ? build : build.get('id');

    return this.store.loadRecords('snapshot', {
      build_id: buildId,
      filter: {
        'review-state-reason': DIFF_REVIEW_STATE_REASONS.join(','),
      },
    });
  }

  getSnapshot(snapshotId) {
    return get(this, 'store').loadRecord('snapshot', snapshotId, {
      include: SNAPSHOT_COMPARISON_INCLUDES.join(','),
    });
  }

  getCommentsForSnapshot(snapshotId, buildId) {
    return this.store.loadRecords('commentThread', {
      build_id: buildId,
      filter: {
        snapshot_ids: [snapshotId],
      },
      include: 'comments,comments.author',
    });
  }

  getSnapshots(snapshotIds, buildId) {
    const ids = snapshotIds.join(',');
    return this.store.loadRecords('snapshot', {
      build_id: buildId,
      filter: {
        'snapshot-ids': ids,
      },
    });
  }

  getSnapshotsWithSortMeta(build) {
    return this.store.loadRecords('snapshot', {
      build_id: build.get('id'),
      filter: {
        'review-state-reason': DIFF_REVIEW_STATE_REASONS.join(','),
      },
      'include-sort-data': true,
      'sort-item-limit': 10,
    });
  }
}
