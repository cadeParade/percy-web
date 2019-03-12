import {clickable, create} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-fixed-top-header]',
  ORG_SETTINGS_LINK: '[data-test-settings-link]',
  ORG_DASHBOARD_LINK: '.data-test-organization-dashboard-link',
};

export const FixedTopHeader = {
  scope: SELECTORS.SCOPE,
  clickOrgSettingsLink: clickable(SELECTORS.ORG_SETTINGS_LINK),
  clickOrgDashboardLink: clickable(SELECTORS.ORG_DASHBOARD_LINK),
};

export default create(FixedTopHeader);
