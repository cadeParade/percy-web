import {visitable, create, text} from 'ember-cli-page-object';
import {ProjectEdit} from 'percy-web/tests/pages/components/forms/project-edit';
import {alias} from 'ember-cli-page-object/macros';
import {BrowserFamilySelector} from 'percy-web/tests/pages/components/projects/browser-family-selector'; // eslint-disable-line
import {WebhookConfigList} from 'percy-web/tests/pages/components/projects/webhook-config-list'; // eslint-disable-line
import {RepoIntegrator} from 'percy-web/tests/pages/components/repo-integrator';

const SELECTORS = {
  DEMO_ENV_VAR: '[data-test-env-var-demo]',
  SLACK_INFO: '[data-test-slack-info]',
  SLACK_INTEGRATIONS_LINK: '[data-test-slack-organization-integrations-link]',
  ARCHIVE_TOGGLE_BUTTON: '[data-test-percy-btn-label=project-archive-toggle-button]',
};

export const ProjectSettingsPage = {
  visitProjectSettings: visitable('/:orgSlug/:projectSlug/settings'),
  visitProjectIntegrations: visitable('/:orgSlug/:projectSlug/integrations'),

  projectEditForm: ProjectEdit,

  isBranchSettingsVisible: alias('projectEditForm.isBranchSettingsVisible'),

  browserSelector: BrowserFamilySelector,

  repoIntegrator: RepoIntegrator,

  webhookConfigList: WebhookConfigList,

  envVarText: text(SELECTORS.DEMO_ENV_VAR),

  slackInfo: {scope: SELECTORS.SLACK_INFO},
  slackIntegrationsLink: {scope: SELECTORS.SLACK_INTEGRATIONS_LINK},

  toggleArchiveButton: {scope: SELECTORS.ARCHIVE_TOGGLE_BUTTON},
};

export default create(ProjectSettingsPage);
