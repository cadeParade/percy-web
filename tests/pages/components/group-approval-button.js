import {clickable, create, hasClass, isVisible, property, text} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-group-approval]',
  BUTTON: '[data-test-group-approval-button]',
  APPROVED_PILL: '[data-test-group-approved]',
};

export const groupApprovalButton = {
  clickButton: clickable(SELECTORS.BUTTON),

  isApproved: isVisible(SELECTORS.APPROVED_PILL),
  isUnapproved: isVisible(SELECTORS.BUTTON),
  isDisabled: property('disabled', SELECTORS.BUTTON),
  isButtonLoading: hasClass('is-loading', SELECTORS.BUTTON),
  isLoading: hasClass('is-loading', SELECTORS.BUTTON),

  buttonText: text(SELECTORS.BUTTON),
  approvedText: text(SELECTORS.APPROVED_PILL),
};

export default create(groupApprovalButton);
