import {clickable, collection, create, isVisible} from 'ember-cli-page-object';
import {collaborationNewThread} from 'percy-web/tests/pages/components/collaboration/new-thread';
import {collaborationComment} from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import {commentThread} from 'percy-web/tests/pages/components/collaboration/comment-thread';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SCOPE: '[data-test-collaboration-panel]',
  COMMENT_THREAD: '[data-test-comment-thread]',
  SHOW_ARCHIVED_COMMENTS: '[data-test-percy-btn-label=show-archived-comments]',
};

export const collaborationPanel = {
  scope: SELECTORS.SCOPE,

  newComment: collaborationNewThread,
  commentThreads: collection(commentThread.scope, commentThread),

  reviewThreads: getter(function () {
    return this.commentThreads.toArray().filterBy('isReviewThread');
  }),
  noteThreads: getter(function () {
    return this.commentThreads.toArray().filterBy('isNoteThread');
  }),

  isShowArchivedCommentsVisible: isVisible(SELECTORS.SHOW_ARCHIVED_COMMENTS),
  showArchivedComments: clickable(SELECTORS.SHOW_ARCHIVED_COMMENTS),
};

export default create(collaborationPanel);
