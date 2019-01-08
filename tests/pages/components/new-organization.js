import {
  clickable,
  create,
  hasClass,
  isPresent,
  is,
  isVisible,
  text,
  value,
  fillable,
} from 'ember-cli-page-object';
import isFocused from 'percy-web/tests/pages/helpers/is-focused';

const SELECTORS = {
  GITHUB_SECTION: '[data-test-setup-github-section]',
  GITHUB_USER: '[data-test-setup-github-account]',
  GITHUB_CONNECT_BUTTON: '[data-test-setup-github-connect-button]',
  PROJECT_FORM_SUBMIT_BUTTON: '.data-test-project-submit-button[data-test-form-submit-button]',
  DEMO_FORM_SUBMIT_BUTTON: '.data-test-demo-submit-button[data-test-form-submit-button]',
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

  isOrgNameFieldFocused: isFocused(SELECTORS.ORG_NAME_INPUT),

  isCreateNewOrganizationDisabled: is(':disabled', SELECTORS.PROJECT_FORM_SUBMIT_BUTTON),
  isCreateNewDemoDisabled: is(':disabled', SELECTORS.DEMO_FORM_SUBMIT_BUTTON),

  isCreateProjectSaving: hasClass('is-loading', SELECTORS.PROJECT_FORM_SUBMIT_BUTTON),
  isCreateDemoSaving: hasClass('is-loading', SELECTORS.DEMO_FORM_SUBMIT_BUTTON),

  clickSubmitNewProject: clickable(SELECTORS.PROJECT_FORM_SUBMIT_BUTTON),
  clickSubmitNewDemo: clickable(SELECTORS.DEMO_FORM_SUBMIT_BUTTON),
};

export default create(NewOrganization);
