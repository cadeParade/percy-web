// these strings must match what comes down from the api
export const GITHUB_ENTERPRISE_INTEGRATION_TYPE = 'github_enterprise';
export const BITBUCKET_CLOUD_INTEGRATION_TYPE = 'bitbucket_cloud';
export const GITHUB_INTEGRATION_TYPE = 'github';
export const GITLAB_INTEGRATION_TYPE = 'gitlab';
export const GITLAB_SELF_HOSTED_INTEGRATION_TYPE = 'gitlab_self_hosted';
export const SLACK_INTEGRATION_TYPE = 'slack';
export const OKTA_INTEGRATION_TYPE = 'okta';

export const INTEGRATION_TYPES = {
  [OKTA_INTEGRATION_TYPE]: {
    textName: 'Okta',
    isBeta: false,
    isGeneralAvailability: true,
    iconName: 'okta-icon-lg',
    organizationIntegrationStatus: 'isOktaIntegrated',
    organizationModelAttribute: 'oktaIntegration',
    settingsRouteSlug: 'okta',
    editSettingsText: 'See settings',
  },
  [BITBUCKET_CLOUD_INTEGRATION_TYPE]: {
    textName: 'Bitbucket Cloud',
    isBeta: false,
    isGeneralAvailability: true,
    iconName: 'bitbucket-icon-lg',
    organizationIntegrationStatus: 'isBitbucketCloudIntegrated',
    organizationModelAttribute: 'bitbucketCloudIntegration',
    settingsRouteSlug: 'bitbucket-cloud',
  },
  [GITHUB_INTEGRATION_TYPE]: {
    textName: 'GitHub',
    isBeta: false,
    isGeneralAvailability: true,
    iconName: 'github-icon-lg',
    organizationIntegrationStatus: 'isGithubIntegrated',
    organizationModelAttribute: 'githubIntegration',
    settingsRouteSlug: 'github',
  },
  [GITHUB_ENTERPRISE_INTEGRATION_TYPE]: {
    textName: 'GitHub Enterprise',
    isBeta: true,
    isGeneralAvailability: false,
    betaLink: 'https://docs.percy.io/docs/github-enterprise',
    iconName: 'github-icon-lg',
    organizationIntegrationStatus: 'isGithubEnterpriseIntegrated',
    organizationModelAttribute: 'githubEnterpriseIntegration',
    settingsRouteSlug: 'github-enterprise',
  },
  [GITLAB_INTEGRATION_TYPE]: {
    textName: 'GitLab',
    isBeta: false,
    isGeneralAvailability: true,
    betaLink: 'https://docs.percy.io/docs/gitlab',
    iconName: 'gitlab-icon-lg',
    organizationIntegrationStatus: 'isGitlabIntegrated',
    organizationModelAttribute: 'gitlabIntegration',
    settingsRouteSlug: 'gitlab',
  },
  [GITLAB_SELF_HOSTED_INTEGRATION_TYPE]: {
    textName: 'GitLab Self-Managed',
    isBeta: false,
    isGeneralAvailability: true,
    betaLink: 'https://docs.percy.io/docs/gitlab-self-hosted',
    iconName: 'gitlab-icon-lg',
    organizationIntegrationStatus: 'isGitlabSelfHostedIntegrated',
    organizationModelAttribute: 'gitlabSelfHostedIntegration',
    settingsRouteSlug: 'gitlab-self-hosted',
  },
  [SLACK_INTEGRATION_TYPE]: {
    textName: 'Slack',
    isBeta: false,
    isGeneralAvailability: true,
    betaLink: 'https://docs.percy.io/docs/slack', // does not exist
    iconName: 'slack-icon',
    organizationIntegrationStatus: 'isSlackIntegrated',
    organizationModelAttribute: 'isSlackIntegrated',
    settingsRouteSlug: 'slack',
    installButtonText: 'Connect',
  },
};
