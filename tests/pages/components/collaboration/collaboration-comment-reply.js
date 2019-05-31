import {clickable, fillable, hasClass, create, is, value} from 'ember-cli-page-object';
import {collaborationComment} from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SCOPE: '[data-test-comment-reply]',
  REPLY_TEXTAREA: '[data-test-comment-reply-textarea]',
  TEXTAREA_CONTAINER: '[data-test-comment-reply-textarea-container]',
  CANCEL: '[data-test-percy-btn-label=cancel]',
  SUBMIT: '[data-test-percy-btn-label=submit]',
};

export const collaborationCommentReply = {
  scope: SELECTORS.SCOPE,
  expandTextarea: clickable(SELECTORS.TEXTAREA_CONTAINER),
  typeComment: fillable(SELECTORS.REPLY_TEXTAREA),
  commentText: value(SELECTORS.REPLY_TEXTAREA),
  submit: {
    scope: SELECTORS.SUBMIT,
    isDisabled: is(':disabled'),
    isLoading: hasClass('is-loading'),
  },
  cancel: {scope: SELECTORS.CANCEL},

  isExpanded: getter(function() {
    return this.submit.isVisible && this.cancel.isVisible;
  }),
  isCollapsed: getter(function() {
    return !this.isExpanded;
  }),
};

export default create(collaborationCommentReply);
