import FactoryGuy from 'ember-data-factory-guy';
import {make, makeList} from 'ember-data-factory-guy';
import {
  SNAPSHOT_APPROVED_STATE,
  SNAPSHOT_UNAPPROVED_STATE,
  SNAPSHOT_REVIEW_STATE_REASONS,
  SNAPSHOT_REJECTED_STATE,
} from 'percy-web/models/snapshot';
import {TEST_COMPARISON_WIDTHS} from 'percy-web/tests/factories/comparison';

FactoryGuy.define('snapshot', {
  default: {
    name: f => `Snapshot ${f.id}`,

    comparisons: FactoryGuy.hasMany('comparison'),
    build: FactoryGuy.belongsTo('build'),
    // screenshots: FactoryGuy.belongsTo('screenshot')

    reviewState: SNAPSHOT_UNAPPROVED_STATE,
  },
  traits: {
    withFinishedBuild: {
      build: FactoryGuy.belongsTo('build', 'finished'),
    },
    approved: {
      reviewState: SNAPSHOT_APPROVED_STATE,
      reviewStateReason: SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED,
    },
    rejected: {
      reviewState: SNAPSHOT_REJECTED_STATE,
      reviewStateReason: SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED,
      commentThreads: FactoryGuy.hasMany('comment-thread', 1, 'autoReview'),
    },

    withBuild: {
      build: () => {
        return make('build');
      },
    },
    withComparisons: {
      comparisons: () => {
        return TEST_COMPARISON_WIDTHS.map(width => {
          return make('comparison', {width});
        });
      },
    },

    withNoDiffs: {
      reviewState: SNAPSHOT_APPROVED_STATE,
      reviewStateReason: 'no_diffs',
      comparisons: () => {
        return TEST_COMPARISON_WIDTHS.map(width => {
          return make('comparison', {width, diffRatio: 0});
        });
      },
    },

    new: {
      comparisons: () => {
        return TEST_COMPARISON_WIDTHS.map(width => {
          return make('comparison', 'new', {width});
        });
      },
    },

    withTwoBrowsers: {
      comparisons: () => {
        return TEST_COMPARISON_WIDTHS.reduce((acc, width) => {
          acc.push(make('comparison', {width: width}));
          acc.push(make('comparison', 'forChrome', {width: width}));
          return acc;
        }, []);
      },
    },
    withScreenshots: {},
    completeExample: {},

    withComments: {
      commentThreads: () => {
        return makeList('comment-thread', 2, 'withTwoComments');
      },
    },
  },
});
