import {focusable, collection, create, isVisible, text} from 'ember-cli-page-object';
import {collaborationComment} from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line

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
  isReplyVisible: isVisible(SELECTORS.COMMENT_REPLY),
  focusReply: focusable(SELECTORS.REPLY_TEXTAREA),
};

export default create(commentThread);
