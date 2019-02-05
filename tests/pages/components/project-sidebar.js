import {text, collection, create, clickable} from 'ember-cli-page-object';
import {SettingsNavWrapper} from 'percy-web/tests/pages/components/organizations/settings-nav-wrapper'; // eslint-disable-line
import {BrowserFamilySelector} from 'percy-web/tests/pages/components/projects/browser-family-selector'; // eslint-disable-line
import {WebhookConfigList} from 'percy-web/tests/pages/components/projects/webhook-config-list'; // eslint-disable-line

const SELECTORS = {
  SIDEBAR_PROJECT_ITEM: '[data-test-project-list-item] a',
  TOGGLE_ARCHIVED_PROJECTS: '[data-test-toggle-archived-projects]',
};

export const ProjectSidebar = {
  projectLinks: collection(SELECTORS.SIDEBAR_PROJECT_ITEM, {
    projectName: text(),
  }),
  toggleArchivedProjects: clickable(SELECTORS.TOGGLE_ARCHIVED_PROJECTS),
};

export default create(ProjectSidebar);
