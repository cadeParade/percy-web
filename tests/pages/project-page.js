import {ProjectContainer} from 'percy-web/tests/pages/components/project-container';
import {visitable, create, isVisible, collection} from 'ember-cli-page-object';
import {alias} from 'ember-cli-page-object/macros';
import {getter} from 'ember-cli-page-object/macros';
import {FixedTopHeader} from 'percy-web/tests/pages/components/fixed-top-header';

const SELECTORS = {
  PROJECT_PAGE: '[data-test-project-page]',
  FRAMEWORK_ITEMS: '[data-test-tech-card]',
  EXAMPLE_PROJECT_BUTTON: '[data-test-example-framework-project-button]',
  FRAMEWORK_DOCS_BUTTON: '[data-test-framework-docs-button]',
  GENERIC_DOCS_BUTTON: '[data-test-generic-docs-button]',
  SDK_REQUEST_FIELD: '[data-test-sdk-request-field]',
  PUBLIC_PROJECT_ICON: '[data-test-public-project-icon]',
};

const ProjectPage = {
  scope: SELECTORS.PROJECT_PAGE,

  visitOrg: visitable('/:orgSlug'),
  visitProject: visitable('/:orgSlug/:projectSlug'),

  fixedTopHeader: FixedTopHeader,
  projectContainer: ProjectContainer,

  builds: alias('projectContainer.builds'),
  finishedBuilds: alias('projectContainer.finishedBuilds'),
  infinityLoader: alias('projectContainer.infinityLoader'),

  clickQuickstartButton: alias('projectContainer.clickQuickstartButton'),

  isNoBuildsPanelVisible: alias('projectContainer.isNoBuildsPanelVisible'),
  isPublicProjectNoticeVisible: alias('projectContainer.isPublicProjectNoticeVisible'),

  isPublicProjectIconVisible: isVisible(SELECTORS.PUBLIC_PROJECT_ICON),
  clickProjectSettings: alias('projectContainer.clickProjectSettings'),

  frameworks: collection(SELECTORS.FRAMEWORK_ITEMS),

  lastFramework: getter(function() {
    const numFrameworks = this.frameworks.length;
    return this.frameworks.objectAt(numFrameworks - 1);
  }),

  isGenericDocsButtonVisible: isVisible(SELECTORS.GENERIC_DOCS_BUTTON),
  isExampleProjectButtonVisible: isVisible(SELECTORS.EXAMPLE_PROJECT_BUTTON),
  isFrameworkDocsButtonVisible: isVisible(SELECTORS.FRAMEWORK_DOCS_BUTTON),

  isSdkRequestFieldVisible: isVisible(SELECTORS.SDK_REQUEST_FIELD),
};

export default create(ProjectPage);
