import {clickable, create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-second-saml-identity-error]',
  SHOW_SUPPORT_LINK: '[data-test-show-support]',
};

const SecondSamlIdentityErrorPage = {
  scope: SELECTORS.CONTAINER,
  clickShowSupportLink: clickable(SELECTORS.SHOW_SUPPORT_LINK),
};

export default create(SecondSamlIdentityErrorPage);
