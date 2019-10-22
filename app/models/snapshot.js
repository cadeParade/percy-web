import DS from 'ember-data';
import {equal, mapBy, max, not, or, notEmpty, filterBy} from '@ember/object/computed';

export const SNAPSHOT_APPROVED_STATE = 'approved';
export const SNAPSHOT_UNAPPROVED_STATE = 'unreviewed';
export const SNAPSHOT_REJECTED_STATE = 'changes_requested';

export const SNAPSHOT_REVIEW_STATE_REASONS = {
  AUTO_APPROVED_BRANCH: 'auto_approved_branch',
  NO_DIFFS: 'no_diffs',
  UNREVIEWED: 'unreviewed_comparisons',
  USER_APPROVED: 'user_approved',
  USER_APPROVED_PREVIOUSLY: 'user_approved_previously',
  USER_REJECTED: 'user_requested_changes',
  USER_REJECTED_PREVIOUSLY: 'user_requested_changes_previously',
};

// These are the possible reviewStateReasons for snapshots that have diffs
export const DIFF_REVIEW_STATE_REASONS = [
  SNAPSHOT_REVIEW_STATE_REASONS.AUTO_APPROVED_BRANCH,
  SNAPSHOT_REVIEW_STATE_REASONS.UNREVIEWED,
  SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED,
  SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED_PREVIOUSLY,
  SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED,
  SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED_PREVIOUSLY,
];

export default DS.Model.extend({
  comparisons: DS.hasMany('comparisons', {
    async: false,
    inverse: 'headSnapshot',
  }),

  commentThreads: DS.hasMany('commentThreads', {async: false}),
  openCommentThreads: filterBy('commentThreads', 'isOpen'),
  hasOpenCommentThreads: notEmpty('openCommentThreads'),

  name: DS.attr(),

  build: DS.belongsTo('build', {async: true}),
  screenshots: DS.hasMany('screenshot', {async: false}),

  fingerprint: DS.attr(),

  latestChangedAncestor: DS.belongsTo('snapshot', {async: true, inverse: null}),
  isReintroduced: DS.attr('boolean'),

  // Review state.
  reviewState: DS.attr(),
  isUnreviewed: equal('reviewState', SNAPSHOT_UNAPPROVED_STATE),
  isApproved: equal('reviewState', SNAPSHOT_APPROVED_STATE),
  isRejected: equal('reviewState', SNAPSHOT_REJECTED_STATE),

  // reviewStateReason provides disambiguation for how reviewState was set, such as when a
  // snapshot was approved automatically by the system when there are no diffs vs. when it is
  // approved by user review.
  //
  // reviewState --> reviewStateReason
  // - 'unreviewed' --> 'unreviewed_comparisons': No reviews have been submitted.
  // - 'approved' --> 'user_approved': approved by user review.
  // - 'approved' --> 'user_approved_previously': automatically approved because a user had recently
  //    approved the same thing in this branch.
  // - 'approved' --> 'no_diffs': automatically approved because there were no visual differences
  //    when compared the baseline.
  // - 'approved' --> 'auto_approved_branch': Automatically approved based on branch name
  // - 'rejected' --> 'user_requested_changes': User clicked "Request changes" button
  //.   in current build
  // - 'rejected' --> 'user_requested_changes_previously':'rejected' status has carried forward
  reviewStateReason: DS.attr(),
  isApprovedByUser: equal('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED),
  isApprovedByUserPreviously: equal(
    'reviewStateReason',
    SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED_PREVIOUSLY,
  ),
  isAutoApprovedBranch: equal(
    'reviewStateReason',
    SNAPSHOT_REVIEW_STATE_REASONS.AUTO_APPROVED_BRANCH,
  ),
  isUnchanged: equal('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.NO_DIFFS),
  isChanged: not('isUnchanged'),

  // Is true for approved in build, approved by carry-forward, and auto-approved by branch.
  isApprovedWithChanges: or(
    'isApprovedByUser',
    'isApprovedByUserPreviously',
    'isAutoApprovedBranch',
  ),

  comparisonWidths: mapBy('comparisons', 'width'),
  maxComparisonWidth: max('comparisonWidths'),
});
