import {create, is, clickable, hasClass} from 'ember-cli-page-object';

const SELECTORS = {
  STRIPE_CARD_COMPONENT: '[data-test-billing-card-updater-stripe-card]',
  SUBMIT_CARD_BUTTON: '[data-test-percy-btn-label=submit]',
  CANCEL: '[data-test-percy-btn-label=cancel]',
};

export const BillingCardUpdater = {
  scope: SELECTORS.STRIPE_CARD_COMPONENT,
  isSubmitCardButtonDisabled: is(':disabled', SELECTORS.SUBMIT_CARD_BUTTON),
  clickSubmitCard: clickable(SELECTORS.SUBMIT_CARD_BUTTON),
  cancel: clickable(SELECTORS.CANCEL),
  isCardSubmitButtonLoading: hasClass('is-loading', SELECTORS.SUBMIT_CARD_BUTTON),
};

export default create(BillingCardUpdater);
