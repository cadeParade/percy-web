import {clickable, create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-sso-login]',
  SHOW_SUPPORT_LINK: '[data-test-sso-show-support]',
};

const SsoLoginPage = {
  scope: SELECTORS.CONTAINER,
  clickShowSupportLink: clickable(SELECTORS.SHOW_SUPPORT_LINK),
};

export default create(SsoLoginPage);
