import {clickable, create, hasClass, is} from 'ember-cli-page-object';

const SELECTORS = {
  BUTTON: '[data-test-build-approval-button]',
};

export const BuildApprovalButton = {
  scope: SELECTORS.BUTTON,
  clickButton: clickable(),
  isLoading: hasClass('is-loading'),
  isApproved: hasClass('is-approved'),
  isDisabled: is(':disabled'),
};

export default create(BuildApprovalButton);
