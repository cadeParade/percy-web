import {clickable, create, hasClass, property} from 'ember-cli-page-object';

const SELECTORS = {
  BUTTON: '[data-test-build-approval-button]',
};

export const BuildApprovalButton = {
  scope: SELECTORS.BUTTON,
  clickButton: clickable(),
  isLoading: hasClass('is-loading'),
  isApproved: hasClass('is-approved'),
  isDisabled: property('disabled'),
};

export default create(BuildApprovalButton);
