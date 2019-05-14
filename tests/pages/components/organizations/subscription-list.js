import {create, clickable, hasClass, fillable, is, isVisible, text} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-subscription-list]',
  SMALL_PLAN_RADIO: '[data-test-radio-input=v3-small]',
  MEDIUM_PLAN_RADIO: '[data-test-radio-input=v3-medium]',
  LARGE_PLAN_RADIO: '[data-test-radio-input=v3-large]',
  CARD_INPUT: '[data-test-stripe-card-input]',
  EMAIL_INPUT: '[data-test-form-input=billing-email]',
  INPUT_SUBMIT_BUTTON: '[data-test-submit-inputs] [data-test-percy-btn]',
  PLAN_SUBMIT_BUTTON: '[data-test-submit-plan] [data-test-percy-btn]',
  PLAN_INFO: '[data-test-plan-info]',
  PLAN_ITEM: '[data-test-plan-item]',
  PlAN_ITEM_RADIO: '[data-test-radio-input]',
};

export const subscriptionList = {
  scope: SELECTORS.SCOPE,

  isEmailInputVisible: isVisible(SELECTORS.EMAIL_INPUT),
  enterBillingEmail: fillable(SELECTORS.EMAIL_INPUT),
  isCardInputVisible: isVisible(SELECTORS.CARD_INPUT),

  isPlanInfoVisible: isVisible(SELECTORS.PLAN_INFO),
  planInfoText: text(SELECTORS.PLAN_INFO),

  isPlanSubmitDisabled: is(':disabled', SELECTORS.PLAN_SUBMIT_BUTTON),
  isInputSubmitDisabled: is(':disabled', SELECTORS.INPUT_SUBMIT_BUTTON),
  submitInputs: clickable(SELECTORS.INPUT_SUBMIT_BUTTON),
  isSubmitInputsButtonLoading: hasClass('is-loading', SELECTORS.INPUT_SUBMIT_BUTTON),
  submitNewPlan: clickable(SELECTORS.PLAN_SUBMIT_BUTTON),
  isSubmitNewPlanButtonLoading: hasClass('is-loading', SELECTORS.PLAN_SUBMIT_BUTTON),

  selectSmallPlan: clickable(SELECTORS.SMALL_PLAN_RADIO),
  selectMediumPlan: clickable(SELECTORS.MEDIUM_PLAN_RADIO),
  selectLargePlan: clickable(SELECTORS.LARGE_PLAN_RADIO),

  isSmallPlanSelected: is(':checked', SELECTORS.SMALL_PLAN_RADIO),
  isMediumPlanSelected: is(':checked', SELECTORS.MEDIUM_PLAN_RADIO),
  isLargePlanSelected: is(':checked', SELECTORS.LARGE_PLAN_RADIO),
};

export default create(subscriptionList);
