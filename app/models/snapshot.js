import classic from 'ember-classic-decorator';
import {filterBy, notEmpty, or, not, max, mapBy, equal} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

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

// Remove @classic when we can refactor away from mixins
@classic
export default class Snapshot extends Model.extend(LoadableModel) {
  @hasMany('comparisons', {
    async: false,
    inverse: 'headSnapshot',
  })
  comparisons;

  @attr()
  totalOpenComments;

  @hasMany('commentThreads', {async: false})
  commentThreads;

  @filterBy('commentThreads', 'isOpen')
  openCommentThreads;

  @notEmpty('openCommentThreads')
  hasOpenCommentThreads;

  @attr()
  name;

  @belongsTo('build', {async: true})
  build;

  @hasMany('screenshot', {async: false})
  screenshots;

  @attr()
  fingerprint;

  @belongsTo('snapshot', {async: true, inverse: null})
  latestChangedAncestor;

  @attr('boolean')
  isReintroduced;

  // Review state.
  @attr()
  reviewState;

  @equal('reviewState', SNAPSHOT_UNAPPROVED_STATE)
  isUnreviewed;

  @equal('reviewState', SNAPSHOT_APPROVED_STATE)
  isApproved;

  @equal('reviewState', SNAPSHOT_REJECTED_STATE)
  isRejected;

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
  @attr()
  reviewStateReason;

  @equal('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED)
  isApprovedByUser;

  @equal('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED_PREVIOUSLY)
  isApprovedByUserPreviously;

  @equal('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.AUTO_APPROVED_BRANCH)
  isAutoApprovedBranch;

  @equal('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.NO_DIFFS)
  isUnchanged;

  @not('isUnchanged')
  isChanged;

  // Is true for approved in build, approved by carry-forward, and auto-approved by branch.
  @or('isApprovedByUser', 'isApprovedByUserPreviously', 'isAutoApprovedBranch')
  isApprovedWithChanges;

  @mapBy('comparisons', 'width')
  comparisonWidths;

  @max('comparisonWidths')
  maxComparisonWidth;
}
