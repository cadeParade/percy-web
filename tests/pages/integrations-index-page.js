import {clickable, create, collection, isVisible, text, visitable} from 'ember-cli-page-object';
// eslint-disable-next-line max-len
import {SELECTORS as IntegrationItemSelectors} from 'percy-web/tests/pages/components/integration-item';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  ALL_INTEGRATION_ITEMS: '[data-test-all-integrations]',
  INTEGRATION_ITEMS: '[data-test-integration-item]',
  BITBUCKET_CLOUD_INTEGRATION: '[data-test-integration-name="bitbucket-cloud"]',
  GITLAB_INTEGRATION: '[data-test-integration-name="gitlab"]',
  GITLAB_SELF_HOSTED_INTEGRATION: '[data-test-integration-name="gitlab-self-hosted"]',
  SLACK_INTEGRATION: '[data-test-integration-name="slack"]',
  OKTA_INTEGRATION: '[data-test-integration-name="okta"]',
  GITHUB_INTEGRATION: '[data-test-integration-name="github"]',
};

export const IntegrationsIndexPage = {
  scope: SELECTORS.ALL_INTEGRATION_ITEMS,

  visitIntegrationsPage: visitable('/organizations/:orgSlug/integrations'),

  integrationItems: collection(SELECTORS.INTEGRATION_ITEMS, {
    isBitbucketCloudIntegration: isVisible(SELECTORS.BITBUCKET_CLOUD_INTEGRATION),
    isGitlabIntegration: isVisible(SELECTORS.GITLAB_INTEGRATION),
    isGitlabSelfHostedIntegration: isVisible(SELECTORS.GITLAB_SELF_HOSTED_INTEGRATION),
    isSlackIntegration: isVisible(SELECTORS.SLACK_INTEGRATION),
    isOktaIntegration: isVisible(SELECTORS.OKTA_INTEGRATION),
    isGithubIntegration: isVisible(SELECTORS.GITHUB_INTEGRATION),
    install: clickable(IntegrationItemSelectors.INSTALL_BUTTON),
    edit: clickable(IntegrationItemSelectors.EDIT_BUTTON),
    integrationName: text(IntegrationItemSelectors.INTEGRATION_NAME),
    hasInstallButton: isVisible(IntegrationItemSelectors.INSTALL_BUTTON),
    hasEditButton: isVisible(IntegrationItemSelectors.EDIT_BUTTON),
    hasContactButton: isVisible(IntegrationItemSelectors.CONTACT_BUTTON),
    hasBetaBadge: isVisible(IntegrationItemSelectors.BETA_BADGE),
  }),

  githubIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isGithubIntegration');
  }),
  hasGithubIntegration: getter(function() {
    return !!this.githubIntegration;
  }),

  bitbucketCloudIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isBitbucketCloudIntegration');
  }),
  hasBitbucketCloudIntegration: getter(function() {
    return !!this.bitbucketCloudIntegration;
  }),

  gitlabIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isGitlabIntegration');
  }),
  hasGitlabIntegration: getter(function() {
    return !!this.gitlabIntegration;
  }),

  gitlabSelfHostedIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isGitlabSelfHostedIntegration');
  }),
  hasGitlabSelfHostedIntegration: getter(function() {
    return !!this.gitlabSelfHostedIntegration;
  }),

  slackIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isSlackIntegration');
  }),
  hasSlackIntegration: getter(function() {
    return !!this.slackIntegration;
  }),

  oktaIntegration: getter(function() {
    return this.integrationItems.toArray().findBy('isOktaIntegration');
  }),
  hasOktaIntegration: getter(function() {
    return !!this.oktaIntegration;
  }),
};

export default create(IntegrationsIndexPage);
