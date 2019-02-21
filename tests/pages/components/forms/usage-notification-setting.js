import {create, is} from 'ember-cli-page-object';

const SELECTORS = {
  CONTAINER: '[data-test-usage-notification-setting-form]',
  EMAILS: '[data-test-textarea-input=usage-notification-emails]',
  ENABLED: '[data-test-checkbox-input=usage-notification-enabled-slider]',
  ERRORS: '.Form-errors',
  SAVE: '[data-test-form-submit-button]',
  THRESHOLDS: '[data-test-form-input=usage-notification-thresholds]',
};

export const UsageNotificationSettingForm = {
  scope: SELECTORS.CONTAINER,

  isEnabled: is(':checked', SELECTORS.ENABLED),
  emails: {scope: SELECTORS.EMAILS},
  thresholds: {scope: SELECTORS.THRESHOLDS},
  errors: {scope: SELECTORS.ERRORS},
  saveButton: {scope: SELECTORS.SAVE},
};

export default create(UsageNotificationSettingForm);
