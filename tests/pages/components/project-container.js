import {collection, clickable, create, isVisible, isPresent} from 'ember-cli-page-object';
import {BuildCard} from 'percy-web/tests/pages/components/build-card';

const SELECTORS = {
  PROJECT_CONTAINER: '[data-test-project-container]',
  REPO_LINKED: '[data-test-project-container-project-repo-linked]',
  GITHUB_LOGO: 'svg[data-test-github-icon]',
  GITLAB_LOGO: 'svg[data-test-gitlab-icon]',
  QUICKSTART_BUTTON: '[data-test-quickstart-button]',
  NO_BUILDS_PANEL: '[data-test-status-panel]',
  PUBIC_PROJECT_NOTICE: '[data-test-public-project-notice]',
  INFINITY_LOADER: '.infinity-loader', // only one possible per page
  PUBLIC_PROJECT_ICON: '[data-test-public-project-icon]',
  PROJECT_SETTINGS_ICON: '[data-test-settings-icon]',
  BRANCH_FILTER_DROPDOWN: '[data-test-project-container-branch-filter]',
  START_NEW_PROJECT_BUTTON: '[data-test-start-new-project] [data-test-percy-btn]',
};

export const ProjectContainer = {
  scope: SELECTORS.PROJECT_CONTAINER,

  builds: collection({
    itemScope: BuildCard.scope,
    item: BuildCard,
  }),

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

  finishedBuilds: {
    isDescriptor: true,
    get() {
      return this.builds().filter(build => !!build.isFinished);
    },
  },

  clickQuickstartButton: clickable(SELECTORS.QUICKSTART_BUTTON),

  isNoBuildsPanelVisible: isVisible(SELECTORS.NO_BUILDS_PANEL),
  isPublicProjectNoticeVisible: isVisible(SELECTORS.PUBLIC_BUILD_NOTICE),

  isPublicProjectIconVisible: isVisible(SELECTORS.PUBLIC_PROJECT_ICON),
  clickProjectSettings: clickable(SELECTORS.PROJECT_SETTINGS_ICON),

  isBranchSelectorVisible: isVisible(SELECTORS.BRANCH_FILTER_DROPDOWN),

  isStartNewProjectButtonVisible: isVisible(SELECTORS.START_NEW_PROJECT_BUTTON),
  clickStartNewProject: clickable(SELECTORS.START_NEW_PROJECT_BUTTON),
};

export default create(ProjectContainer);
