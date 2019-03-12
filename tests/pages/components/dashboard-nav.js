import {create, clickable, isPresent} from 'ember-cli-page-object';

const SELECTORS = {
  DASHBOARD_NAV_BAR: '[data-test-dashboard-nav]',
  PROJECT_PAGE_LINK: '.data-test-dashboard-nav-projects',
  ORG_SETTINGS_LINK: '.data-test-dashboard-nav-org-settings',
  ORG_BILLING_LINK: '.data-test-dashboard-nav-org-billing',
  ORG_USERS_LINK: '.data-test-dashboard-nav-org-users',
  ORG_INTEGRATIONS_LINK: '.data-test-dashboard-nav-org-integrations',
  NEW_PROJECT_BUTTON: '.data-test-dashboard-nav-new-project',
};

export const DashboardNav = {
  scope: SELECTORS.DASHBOARD_NAV_BAR,

  clickProjectsLink: clickable(SELECTORS.PROJECT_PAGE_LINK),
  isProjectLinkPresent: isPresent(SELECTORS.PROJECT_PAGE_LINK),

  clickOrgSettingsLink: clickable(SELECTORS.ORG_SETTINGS_LINK),
  isOrgSettingsLinkPresent: isPresent(SELECTORS.ORG_SETTINGS_LINK),

  clickBillingLink: clickable(SELECTORS.ORG_BILLING_LINK),
  isBillingLinkPresent: isPresent(SELECTORS.ORG_BILLING_LINK),

  clickUsersLink: clickable(SELECTORS.ORG_USERS_LINK),
  isUsersLinkPresent: isPresent(SELECTORS.ORG_USERS_LINK),

  clickIntegrationsLink: clickable(SELECTORS.ORG_INTEGRATIONS_LINK),
  isIntegrationsLinkPresent: isPresent(SELECTORS.ORG_INTEGRATIONS_LINK),

  clickNewProjectButton: clickable(SELECTORS.NEW_PROJECT_BUTTON),
  isNewProjectButtonPresent: isPresent(SELECTORS.NEW_PROJECT_BUTTON),
};

export default create(DashboardNav);
