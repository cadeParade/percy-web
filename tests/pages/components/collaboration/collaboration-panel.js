import {collection, create} from 'ember-cli-page-object';
import {collaborationNewThread} from 'percy-web/tests/pages/components/collaboration/new-thread';
import {collaborationComment} from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import {commentThread} from 'percy-web/tests/pages/components/collaboration/comment-thread';

const SELECTORS = {
  SCOPE: '[data-test-collaboration-panel]',
  COMMENT_THREAD: '[data-test-comment-thread]',
};

export const collaborationPanel = {
  scope: SELECTORS.SCOPE,

  newComment: collaborationNewThread,
  commentThreads: collection(commentThread.scope, commentThread),
};

export default create(collaborationPanel);
