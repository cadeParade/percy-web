// these strings must match what comes down from the api
export const GITHUB_ENTERPRISE_INTEGRATION_TYPE = 'github_enterprise';
export const GITHUB_INTEGRATION_TYPE = 'github';
export const GITLAB_INTEGRATION_TYPE = 'gitlab';
export const GITLAB_SELF_HOSTED_INTEGRATION_TYPE = 'gitlab_self_hosted';
const SLACK_INTEGRATION_TYPE = 'slack';

export const INTEGRATION_TYPES = {
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
  },
};
