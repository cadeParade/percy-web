import {clickable, create, fillable, is, isVisible, value} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-new-comment]',
  NEW_COMMENT_BUTTON: '[data-test-percy-btn-label=showNewCommentTextarea]',
  CANCEL_COMMENT_BUTTON: '[data-test-percy-btn-label=cancelNewComment]',
  NEW_COMMENT_CONTAINER: '[data-test-new-comment-container]',
  NEW_COMMENT_TEXTAREA: '[data-test-new-comment-textarea]',
  SAVE_COMMENT: '[data-test-percy-btn-label=saveNewComment]',
  REQUEST_CHANGES_CHECKBOX: '[data-test-request-changes-checkbox]',
};

export const collaborationNewThread = {
  scope: SELECTORS.SCOPE,
  isNewThreadButtonVisible: isVisible(SELECTORS.NEW_COMMENT_BUTTON),
  clickNewThreadButton: clickable(SELECTORS.NEW_COMMENT_BUTTON),
  isNewThreadContainerVisible: isVisible(SELECTORS.NEW_COMMENT_CONTAINER),
  typeNewComment: fillable(SELECTORS.NEW_COMMENT_TEXTAREA),
  textareaValue: value(SELECTORS.NEW_COMMENT_TEXTAREA),
  checkRequestChangesBox: clickable(SELECTORS.REQUEST_CHANGES_CHECKBOX),
  submitNewThread: clickable(SELECTORS.SAVE_COMMENT),
  isSubmitDisabled: is(':disabled', SELECTORS.SAVE_COMMENT),
  cancelNewThread: clickable(SELECTORS.CANCEL_COMMENT_BUTTON),
};

export default create(collaborationNewThread);
