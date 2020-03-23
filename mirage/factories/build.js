import {Factory, trait} from 'ember-cli-mirage';
import moment from 'moment';
import {
  BUILD_STATES,
  BUILD_REVIEW_STATE_REASONS,
  BUILD_APPROVED_STATE,
  BUILD_UNREVIEWED_STATE,
  BUILD_REJECTED_STATE,
} from 'percy-web/models/build';

export default Factory.extend({
  branch: 'master',
  state: BUILD_STATES.FINISHED,
  reviewState: BUILD_UNREVIEWED_STATE,
  reviewStateReason: BUILD_REVIEW_STATE_REASONS.UNREVIEWED,
  totalSnapshots: 4,
  totalSnapshotsUnreviewed: 3,
  totalComparisonsDiff: 8,
  totalComparisonsFinished: 12,
  totalOpenComments: 0,
  partial: false,

  createdAt() {
    return moment();
  },
  buildNumber(i) {
    return i + 1;
  },

  afterCreate(build, server) {
    const browser = server.create('browser');
    build.update('browsers', [browser]);
  },

  rejected: trait({
    state: BUILD_STATES.FINISHED,
    reviewState: BUILD_REJECTED_STATE,
    reviewStateReason: BUILD_REVIEW_STATE_REASONS.SNAPSHOT_REJECTED,
    totalSnapshotsRequestingChanges: 2,
  }),

  approved: trait({
    state: BUILD_STATES.FINISHED,
    reviewState: BUILD_APPROVED_STATE,
    reviewStateReason: BUILD_REVIEW_STATE_REASONS.ALL_SNAPSHOTS_APPROVED,
    approvedAt: moment(),
  }),

  approvedPreviously: trait({
    state: BUILD_STATES.FINISHED,
    reviewState: BUILD_APPROVED_STATE,
    reviewStateReason: BUILD_REVIEW_STATE_REASONS.ALL_SNAPSHOTS_APPROVED_PREVIOUSLY,
    approvedAt: moment(),
  }),

  approvedWithNoDiffs: trait({
    state: BUILD_STATES.FINISHED,
    reviewState: BUILD_APPROVED_STATE,
    reviewStateReason: BUILD_REVIEW_STATE_REASONS.NO_DIFFS,
    totalComparisonsDiff: 0,
    approvedAt: moment(),
  }),

  approvedAutoBranch: trait({
    state: BUILD_STATES.FINISHED,
    reviewState: BUILD_APPROVED_STATE,
    reviewStateReason: BUILD_REVIEW_STATE_REASONS.AUTO_APPROVED_BRANCH,
    approvedAt: moment(),
    afterCreate(build, server) {
      server.create('snapshot', 'autoApprovedBranch', {build});
    },
  }),

  pending: trait({
    state: BUILD_STATES.PENDING,
  }),

  expired: trait({
    state: BUILD_STATES.EXPIRED,
  }),

  failed: trait({
    state: BUILD_STATES.FAILED,
  }),

  failedWithTimeout: trait({
    state: BUILD_STATES.FAILED,
    failureReason: 'render_timeout',
  }),

  failedWithNoSnapshots: trait({
    state: BUILD_STATES.FAILED,
    failureReason: 'no_snapshots',
  }),

  failedWithMissingResources: trait({
    state: BUILD_STATES.FAILED,
    failureReason: 'missing_resources',
  }),

  failedWithMissingFinalize: trait({
    state: BUILD_STATES.FAILED,
    failureReason: 'missing_finalize',
  }),

  processing: trait({
    state: BUILD_STATES.PROCESSING,
    totalComparisons: 2312,
    totalComparisonsFinished: 1543,
  }),

  withSnapshots: trait({
    afterCreate(build, server) {
      server.createList('snapshot', 3, 'withComparison', {build});
      server.create('snapshot', 'noDiffs', {build});
    },
  }),

  withTwoBrowsers: trait({
    afterCreate(build, server) {
      const ids = build.browserIds;
      const chromeBrowser = server.create('browser', 'chrome');
      ids.push(chromeBrowser.id);
      build.save();
    },
  }),
});
