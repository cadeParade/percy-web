import {create, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  REPO_SELECTOR: '[data-test-repo-selector]',
  NO_INTEGRATIONS_MESSAGE: '[data-test-repo-integrator-no-integrations]',
};

export const RepoIntegrator = {
  isRepoSelectorVisible: isVisible(SELECTORS.REPO_SELECTOR),
  isNoIntegrationsMessageVisible: isVisible(SELECTORS.NO_INTEGRATIONS_MESSAGE),
};

export default create(RepoIntegrator);
