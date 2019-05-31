import {collection, create, text} from 'ember-cli-page-object';
import {collaborationComment} from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import {collaborationCommentReply} from 'percy-web/tests/pages/components/collaboration/collaboration-comment-reply'; // eslint-disable-line
import {alias} from 'ember-cli-page-object/macros';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SCOPE: '[data-test-comment-thread]',
  EXPAND_COMMENTS: '[data-test-expand-comments]',
  COMMENT_REPLY: '[data-test-comment-reply]',
  REPLY_TEXTAREA: '[data-test-comment-reply-textarea]',
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

  isResolved: alias('firstComment.isResolved'),
  isArchived: alias('firstComment.isArchived'),
  isClosed: getter(function() {
    return this.isResolved || this.isArchived;
  }),
};

export default create(commentThread);
