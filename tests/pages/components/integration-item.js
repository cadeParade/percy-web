import {create, text, isPresent, attribute, clickable} from 'ember-cli-page-object';

export const SELECTORS = {
  INSTALL_BUTTON: '.data-test-integration-button-install',
  DISABLED_BADGE: '[data-test-integration-disabled-badge]',
  EDIT_BUTTON: '.data-test-integration-button-edit',
  CONTACT_BUTTON: '[data-test-integration-button-contact-us]',
  BETA_BADGE: '[data-test-integration-beta-badge]',
  INTEGRATION_NAME: '[data-test-integration-name]',
};

export const IntegrationItem = {
  integrationName: text(SELECTORS.INTEGRATION_NAME),

  contactButtonLink: attribute('href', SELECTORS.CONTACT_BUTTON),

  installButton: {scope: SELECTORS.INSTALL_BUTTON},
  hasDisabledBadge: isPresent(SELECTORS.DISABLED_BADGE),
  hasEditButton: isPresent(SELECTORS.EDIT_BUTTON),
  hasContactButton: isPresent(SELECTORS.CONTACT_BUTTON),
  hasBetaBadge: isPresent(SELECTORS.BETA_BADGE),

  clickContactButton: clickable(SELECTORS.CONTACT_BUTTON),
};

export default create(IntegrationItem);
