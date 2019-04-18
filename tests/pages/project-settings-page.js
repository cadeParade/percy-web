import {visitable, create, text} from 'ember-cli-page-object';
import {ProjectEdit} from 'percy-web/tests/pages/components/forms/project-edit';
import {alias} from 'ember-cli-page-object/macros';
import {BrowserFamilySelector} from 'percy-web/tests/pages/components/projects/browser-family-selector'; // eslint-disable-line
import {WebhookConfigList} from 'percy-web/tests/pages/components/projects/webhook-config-list'; // eslint-disable-line
import {RepoIntegrator} from 'percy-web/tests/pages/components/repo-integrator';

const SELECTORS = {
  DEMO_ENV_VAR: '[data-test-env-var-demo]',
};

export const ProjectSettingsPage = {
  visitProjectSettings: visitable('/:orgSlug/:projectSlug/settings'),

  projectEditForm: ProjectEdit,

  isAutoApproveBranchesVisible: alias('projectEditForm.isAutoApproveBranchesVisible'),

  browserSelector: BrowserFamilySelector,

  repoIntegrator: RepoIntegrator,

  webhookConfigList: WebhookConfigList,

  envVarText: text(SELECTORS.DEMO_ENV_VAR),
};

export default create(ProjectSettingsPage);
