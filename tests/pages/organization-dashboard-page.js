import {create, collection, clickable, isVisible} from 'ember-cli-page-object';
import {DashboardNav} from 'percy-web/tests/pages/components/dashboard-nav';

const SELECTORS = {
  PROJECT_ITEM: '[data-test-project-list-item]',
  PROJECT_LINK: '[data-test-project-link]',
  SHOW_ARCHIVED_PROJECTS_LINK: '[data-test-show-archived-projects]',
  LOADING_PROJECT_CARD: '[data-test-loading-project-card]',
};

export const OrganizationDashboard = {
  nav: DashboardNav,
  projects: collection(SELECTORS.PROJECT_ITEM, {
    clickLink: clickable(SELECTORS.PROJECT_LINK),
  }),

  loadingProjectCards: collection(SELECTORS.LOADING_PROJECT_CARD),

  toggleArchivedProjects: clickable(SELECTORS.SHOW_ARCHIVED_PROJECTS_LINK),
  isToggleArchivedProjectsVisible: isVisible(SELECTORS.SHOW_ARCHIVED_PROJECTS_LINK),
};

export default create(OrganizationDashboard);
