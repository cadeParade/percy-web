import {
  clickable,
  create,
  isPresent,
  is,
  isVisible,
  text,
  value,
  fillable,
} from 'ember-cli-page-object';

const SELECTORS = {
  GITHUB_SECTION: '[data-test-setup-github-section]',
  GITHUB_USER: '[data-test-setup-github-account]',
  GITHUB_CONNECT_BUTTON: '[data-test-setup-github-connect-button]',
  FORM_SUBMIT_BUTTON: '[data-test-form-submit-button]',
  ORG_NAME_INPUT: '[data-test-form-input=organization-name]',
  USER_EMAIL_INPUT: '[data-test-form-input=user-email]',
};

export const NewOrganization = {
  hasGithubSection: isPresent(SELECTORS.GITHUB_SECTION),
  hasConnectedGithubAccount: isPresent(SELECTORS.GITHUB_USER),
  hasConnectToGithubButton: isPresent(SELECTORS.GITHUB_CONNECT_BUTTON),
  githubAccountName: text(SELECTORS.GITHUB_USER),

  isOrgNameFieldVisible: isVisible(SELECTORS.ORG_NAME_INPUT),
  organizationName: fillable(SELECTORS.ORG_NAME_INPUT),

  isUserEmailFieldVisible: isVisible(SELECTORS.USER_EMAIL_INPUT),
  fillUserEmail: fillable(SELECTORS.USER_EMAIL_INPUT),
  userEmailValue: value(SELECTORS.USER_EMAIL_INPUT),

  isCreateNewOrganizationDisabled: is(':disabled', SELECTORS.FORM_SUBMIT_BUTTON),
  clickSubmit: clickable(SELECTORS.FORM_SUBMIT_BUTTON),
};

export default create(NewOrganization);
