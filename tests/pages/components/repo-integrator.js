import {clickable, create, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  REPO_SELECTOR: '[data-test-repo-selector]',
  NO_INTEGRATIONS_MESSAGE: '[data-test-repo-integrator-no-integrations]',
  DEMO_NOTICE: '[data-test-repo-integrator-demo-project]',
  DEMO_LINK: '[data-test-repo-integrator-demo-link]',
  GITHUB_LINK: '[data-test-github]',
  GITLAB_LINK: '[data-test-gitlab]',
  BITBUCKET_LINK: '[data-test-bitbucket]',
};

export const RepoIntegrator = {
  isRepoSelectorVisible: isVisible(SELECTORS.REPO_SELECTOR),
  isNoIntegrationsMessageVisible: isVisible(SELECTORS.NO_INTEGRATIONS_MESSAGE),
  demoNotice: {scope: SELECTORS.DEMO_NOTICE},
  clickDemoLink: clickable(SELECTORS.DEMO_LINK),
  clickGithub: clickable(SELECTORS.GITHUB_LINK),
  clickGitlab: clickable(SELECTORS.GITLAB_LINK),
  clickBitbucket: clickable(SELECTORS.BITBUCKET_LINK),
};

export default create(RepoIntegrator);
