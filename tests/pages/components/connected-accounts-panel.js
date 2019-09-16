import {clickable, isVisible, visitable, create} from 'ember-cli-page-object';

const SELECTORS = {
  ADD_EMAIL_PASSWORD_IDENTITY_BUTTON: '[data-test-connected-accounts-panel-add-ep-identity]',
  DELETE_EMAIL_PASSWORD_IDENTITY_BUTTON: '[data-test-connected-accounts-panel-delete-ep-identity]',
  ADD_GITHUB_IDENTITY_BUTTON: '[data-test-connected-accounts-panel-add-github-identity]',
  DELETE_GITHUB_IDENTITY_BUTTON: '[data-test-connected-accounts-panel-delete-github-identity]',
  EMAIL_PASSWORD_IDENTITY_FORM: '[data-test-connected-accounts-email-password-form]',
  OKTA_IDENTITY: '[data-test-okta-profile-identity]',
};

export const ConnectedAccountsPanel = {
  visitConnectedAccounts: visitable('/settings/connected-accounts'),

  isOktaIdentityVisible: isVisible(SELECTORS.OKTA_IDENTITY),

  isAddAuth0IdentityVisible: isVisible(SELECTORS.ADD_EMAIL_PASSWORD_IDENTITY_BUTTON),
  clickAddAuth0Identity: clickable(SELECTORS.ADD_EMAIL_PASSWORD_IDENTITY_BUTTON),

  isDeleteAuth0IdentityVisible: isVisible(SELECTORS.DELETE_EMAIL_PASSWORD_IDENTITY_BUTTON),
  clickDeleteAuth0Identity: clickable(SELECTORS.DELETE_EMAIL_PASSWORD_IDENTITY_BUTTON),

  isAddGithubIdentityVisible: isVisible(SELECTORS.ADD_GITHUB_IDENTITY_BUTTON),
  clickAddGithubIdentity: clickable(SELECTORS.ADD_GITHUB_IDENTITY_BUTTON),

  isDeleteGithubIdentityVisible: isVisible(SELECTORS.DELETE_GITHUB_IDENTITY_BUTTON),
  clickDeleteGithubIdentity: clickable(SELECTORS.DELETE_GITHUB_IDENTITY_BUTTON),
};

export default create(ConnectedAccountsPanel);
