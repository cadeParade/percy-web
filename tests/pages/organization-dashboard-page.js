import {create, collection, clickable} from 'ember-cli-page-object';
import {DashboardNav} from 'percy-web/tests/pages/components/dashboard-nav';

const SELECTORS = {
  PROJECT_ITEM: '[data-test-project-list-item]',
  PROJECT_LINK: '[data-test-project-link]',
};

export const OrganizationDashboard = {
  nav: DashboardNav,
  projects: collection(SELECTORS.PROJECT_ITEM, {
    clickLink: clickable(SELECTORS.PROJECT_LINK),
  }),
};

export default create(OrganizationDashboard);
