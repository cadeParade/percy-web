import {attribute, collection, create, text} from 'ember-cli-page-object';
import {collaborationComment} from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import {collaborationCommentReply} from 'percy-web/tests/pages/components/collaboration/collaboration-comment-reply'; // eslint-disable-line
import {alias} from 'ember-cli-page-object/macros';
import {getter} from 'ember-cli-page-object/macros';
import {REVIEW_COMMENT_TYPE, NOTE_COMMENT_TYPE} from 'percy-web/models/comment-thread';

const SELECTORS = {
  SCOPE: '[data-test-comment-thread]',
  EXPAND_COMMENTS: '[data-test-expand-comments]',
  COMMENT_REPLY: '[data-test-comment-reply]',
  REPLY_TEXTAREA: '[data-test-comment-reply-textarea]',
  REVIEW_TYPE: '[data-test-thread-type=request_changes]',
  NOTE_TYPE: '[data-test-thread-type=note]',
};

export const commentThread = {
  scope: SELECTORS.SCOPE,
  comments: collection(collaborationComment.scope, collaborationComment),
  expandComments: {
    scope: SELECTORS.EXPAND_COMMENTS,
    collapsedCommentCount: text(),
  },

  reply: collaborationCommentReply,

  focusReply: alias('reply.expandTextarea'),
  typeReply: alias('reply.typeComment'),
  submitReply: alias('reply.submit.click'),

  firstComment: getter(function() {
    return this.comments[0];
  }),

  close: alias('firstComment.close'),

  isArchived: alias('firstComment.isArchived'),
  isResolved: alias('firstComment.isResolved'),
  isClosed: getter(function() {
    return this.isArchived;
  }),

  _type: attribute('data-test-thread-type'),
  isReviewThread: getter(function() {
    return this._type === REVIEW_COMMENT_TYPE;
  }),

  isNoteThread: getter(function() {
    return this._type === NOTE_COMMENT_TYPE;
  }),

  isRejectBadgeVisible: alias('firstComment.requestChangesBadge.isVisible'),
  wasRejectedPreviously: alias('firstComment.requestChangesBadge.isRequestedPreviously'),
  previousBuildHref: alias('firstComment.requestChangesBadge.previousBuildLinkHref'),
  goToOriginatingSnapshot: alias('firstComment.requestChangesBadge.goToOriginatingSnapshot'),
};

export default create(commentThread);
