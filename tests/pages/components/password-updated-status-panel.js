import {clickable, isVisible, isPresent, create} from 'ember-cli-page-object';

const SELECTORS = {
  SUCCESS_ICON: 'svg[data-test-thumbs-up-large-icon]',
  FAIL_ICON: 'svg[data-test-error-large-icon]',
  SETTINGS_BUTTON: '.test-password-updated-settings-link',
  SIGN_IN_BUTTON: '.test-password-updated-signin-link',
};

export const PasswordUpdatedStatusPanel = {
  isSuccessIconPresent: isPresent(SELECTORS.SUCCESS_ICON),
  isFailIconPresent: isPresent(SELECTORS.FAIL_ICON),

  isSettingsButtonVisible: isVisible(SELECTORS.SETTINGS_BUTTON),
  isSigninButtonVisible: isVisible(SELECTORS.SIGN_IN_BUTTON),

  clickSettings: clickable(SELECTORS.SETTINGS_BUTTON),
  clickSignin: clickable(SELECTORS.SIGN_IN_BUTTON),
};

export default create(PasswordUpdatedStatusPanel);
