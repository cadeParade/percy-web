import {attribute, create, hasClass, isVisible, text} from 'ember-cli-page-object';
import {alias} from 'ember-cli-page-object/macros';

const SELECTORS = {
  BUILD_CARD: '[data-test-build-card]',
  BUILD_STATE: '[data-test-build-card-state]',
  SOURCE_CODE_METADATA: '[data-test-build-card-source-code-metadata]',
  GITHUB_LOGO: 'svg[data-test-github-icon]',
  GITLAB_LOGO: 'svg[data-test-gitlab-icon]',
  COMMIT_DETAILS: '[data-test-build-card-commit-details]',
  PULL_REQUEST_LINK: '[data-test-pull-request-link]',
  STATUS_PILL: '[data-test-build-state]',
};

export const BuildCard = {
  scope: SELECTORS.BUILD_CARD,

  statusPill: {
    scope: SELECTORS.STATUS_PILL,
    isFinished: hasClass('is-finished'),
  },

  isFinished: alias('statusPill.isFinished'),

  commitDetails: {
    scope: SELECTORS.COMMIT_DETAILS,
    pullRequestUrl: {
      scope: SELECTORS.PULL_REQUEST_LINK,
      text: text(),
      link: attribute('href', 'a'),
    },
  },
  sourceCodeMetadata: {
    scope: SELECTORS.SOURCE_CODE_METADATA,
    githubLogo: {
      scope: SELECTORS.GITHUB_LOGO,
      isVisible: isVisible(),
    },
    gitlabLogo: {
      scope: SELECTORS.GITLAB_LOGO,
      isVisible: isVisible(),
    },
  },
};

export default create(BuildCard);
