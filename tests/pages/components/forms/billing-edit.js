import {fillable, clickable, create, hasClass, is, text} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-billing-edit-form]',
  EMAIL_INPUT: '[data-test-form-input=billing-email]',
  SUBMIT: '[data-test-form-submit-button]',
  INPUT_ERRORS: '[data-test-input-errors]',
  CANCEL: '[data-test-percy-btn]',
};

export const billingEdit = {
  scope: SELECTORS.SCOPE,

  enterEmail: fillable(SELECTORS.EMAIL_INPUT),
  submit: clickable(SELECTORS.SUBMIT),
  errorText: text(SELECTORS.INPUT_ERRORS),
  isSubmitDisabled: is(':disabled', SELECTORS.SUBMIT),
  isSubmitLoading: hasClass('is-loading', SELECTORS.SUBMIT),
  cancel: clickable(SELECTORS.CANCEL),
};

export default create(billingEdit);
