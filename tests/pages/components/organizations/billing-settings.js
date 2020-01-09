import {clickable, create, isVisible, text} from 'ember-cli-page-object';
import {BillingCardUpdater} from 'percy-web/tests/pages/components/organizations/billing-card-updater'; // eslint-disable-line
import {billingEdit} from 'percy-web/tests/pages/components/forms/billing-edit';

export const SELECTORS = {
  SCOPE: '[data-test-billing-settings]',
  EMAIL_INFO: '[data-test-billing-email]',
  CARD_INFO: '[data-test-billing-card-present]',
  CARD_INFO_ABSENT: '[data-test-billing-card-not-present]',
  OPEN_EMAIL_FORM: '[data-test-open-edit-email]',
  OPEN_CARD_FORM: '[data-test-open-edit-card]',
  SUBMIT_EMAIL_BUTTON: `${billingEdit.scope} [data-test-form-submit-button]`,
};

export const billingSettings = {
  scope: SELECTORS.SCOPE,

  isEmailInfoVisible: isVisible(SELECTORS.EMAIL_INFO),
  isCardInfoVisible: isVisible(SELECTORS.CARD_INFO),
  cardInfo: text(SELECTORS.CARD_INFO),
  isEmptyCardInfoVisible: isVisible(SELECTORS.CARD_INFO_ABSENT),

  openEmailForm: clickable(SELECTORS.OPEN_EMAIL_FORM),
  openCardForm: clickable(SELECTORS.OPEN_CARD_FORM),

  emailForm: billingEdit,
  cardForm: BillingCardUpdater,
};

export default create(billingSettings);
