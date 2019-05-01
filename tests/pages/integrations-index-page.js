import {clickable, create, collection, isVisible, text, visitable} from 'ember-cli-page-object';
// eslint-disable-next-line max-len
import {SELECTORS as IntegrationItemSelectors} from 'percy-web/tests/pages/components/integration-item';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  ALL_INTEGRATION_ITEMS: '[data-test-all-integrations]',
  INTEGRATION_ITEMS: '[data-test-integration-item]',
  GITLAB_INTEGRATION: '[data-test-integration-name="gitlab"]',
  GITLAB_SELF_HOSTED_INTEGRATION: '[data-test-integration-name="gitlab-self-hosted"]',
  SLACK_INTEGRATION: '[data-test-integration-name="slack"]',
};

export const IntegrationsIndexPage = {
  scope: SELECTORS.ALL_INTEGRATION_ITEMS,

  visitIntegrationsPage: visitable('/organizations/:orgSlug/integrations'),

  integrationItems: collection(SELECTORS.INTEGRATION_ITEMS, {
    isGitlabIntegration: isVisible(SELECTORS.GITLAB_INTEGRATION),
    isGitlabSelfHostedIntegration: isVisible(SELECTORS.GITLAB_SELF_HOSTED_INTEGRATION),
    isSlackIntegration: isVisible(SELECTORS.SLACK_INTEGRATION),
    install: clickable(IntegrationItemSelectors.INSTALL_BUTTON),
    edit: clickable(IntegrationItemSelectors.EDIT_BUTTON),
    integrationName: text(IntegrationItemSelectors.INTEGRATION_NAME),
    hasInstallButton: isVisible(IntegrationItemSelectors.INSTALL_BUTTON),
    hasEditButton: isVisible(IntegrationItemSelectors.EDIT_BUTTON),
    hasContactButton: isVisible(IntegrationItemSelectors.CONTACT_BUTTON),
    hasBetaBadge: isVisible(IntegrationItemSelectors.BETA_BADGE),
  }),

  gitlabIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isGitlabIntegration');
  }),

  gitlabSelfHostedIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isGitlabSelfHostedIntegration');
  }),

  slackIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isSlackIntegration');
  }),
};

export default create(IntegrationsIndexPage);
