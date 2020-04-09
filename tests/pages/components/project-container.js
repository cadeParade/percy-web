import {collection, clickable, create, isVisible, isPresent} from 'ember-cli-page-object';
import {getter} from 'ember-cli-page-object/macros';
import {BuildCard} from 'percy-web/tests/pages/components/build-card';

const SELECTORS = {
  PROJECT_CONTAINER: '[data-test-project-container]',
  REPO_LINKED: '[data-test-project-container-project-repo-linked]',
  GITHUB_LOGO: 'svg[data-test-github-icon]',
  GITLAB_LOGO: 'svg[data-test-gitlab-icon]',
  NO_BUILDS_PANEL: '[data-test-status-panel]',
  PUBIC_PROJECT_NOTICE: '[data-test-public-project-notice]',
  INFINITY_LOADER: '.infinity-loader', // only one possible per page
  PROJECT_SETTINGS_ICON: '[data-test-settings-icon]',
  BRANCH_FILTER_DROPDOWN: '[data-test-project-container-branch-filter]',
  INTEGRATION_PROMPT: '[data-test-integration-prompt]',
  ADD_INTEGRATION: '[data-test-add-integration]',
  LOADING_BUILD_CARD: '[data-test-loading-build-card]',
};

export const ProjectContainer = {
  scope: SELECTORS.PROJECT_CONTAINER,

  builds: collection(BuildCard.scope, BuildCard),

  infinityLoader: {
    scope: SELECTORS.INFINITY_LOADER,
    isPresent: isPresent(),
  },

  repoLinked: {
    scope: SELECTORS.REPO_LINKED,
    githubLogo: {
      scope: SELECTORS.GITHUB_LOGO,
      isVisible: isVisible(),
    },
    gitlabLogo: {
      scope: SELECTORS.GITLAB_LOGO,
      isVisible: isVisible(),
    },
  },

  integrationPrompt: {
    scope: SELECTORS.INTEGRATION_PROMPT,
    addIntegration: clickable(SELECTORS.ADD_INTEGRATION),
  },

  finishedBuilds: getter(function () {
    return this.builds.filter(build => !!build.isFinished);
  }),

  isNoBuildsPanelVisible: isVisible(SELECTORS.NO_BUILDS_PANEL),
  isPublicProjectNoticeVisible: isVisible(SELECTORS.PUBLIC_BUILD_NOTICE),

  clickProjectSettings: clickable(SELECTORS.PROJECT_SETTINGS_ICON),

  isBranchSelectorVisible: isVisible(SELECTORS.BRANCH_FILTER_DROPDOWN),

  loadingBuildCards: collection(SELECTORS.LOADING_BUILD_CARD),
};

export default create(ProjectContainer);
