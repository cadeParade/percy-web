import {equal} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';
import {computed} from '@ember/object';
import {
  BITBUCKET_CLOUD_INTEGRATION_TYPE,
  GITHUB_INTEGRATION_TYPE,
  GITHUB_ENTERPRISE_INTEGRATION_TYPE,
  GITLAB_INTEGRATION_TYPE,
  GITLAB_SELF_HOSTED_INTEGRATION_TYPE,
  INTEGRATION_TYPES,
} from 'percy-web/lib/integration-types';

export default Model.extend({
  organization: belongsTo('organization'),
  integrationType: attr(),
  bitbucketCloudClientKey: attr(),
  githubInstallationId: attr(),
  githubHtmlUrl: attr(),
  githubEnterpriseInstallationId: attr(),
  githubEnterpriseIntegrationId: attr(),
  gitlabIntegrationId: attr(),
  gitlabHost: attr(),
  gitlabPersonalAccessToken: attr(),
  isGitlabPersonalAccessTokenPresent: attr('boolean'),
  status: attr(),

  isSyncing: attr(),
  lastUpdatedAt: attr(),

  isBitbucketCloudIntegration: equal('integrationType', BITBUCKET_CLOUD_INTEGRATION_TYPE),
  isGithubIntegration: equal('integrationType', GITHUB_INTEGRATION_TYPE),
  isGithubEnterpriseIntegration: equal('integrationType', GITHUB_ENTERPRISE_INTEGRATION_TYPE),
  isGitlabIntegration: equal('integrationType', GITLAB_INTEGRATION_TYPE),
  isGitlabSelfHostedIntegration: equal('integrationType', GITLAB_SELF_HOSTED_INTEGRATION_TYPE),
  friendlyName: computed('integrationType', function() {
    let integrationType = this.integrationType;
    if (integrationType) {
      let integrationItem = INTEGRATION_TYPES[integrationType];
      if (integrationItem) {
        return integrationItem['textName'];
      }
    }
    return '';
  }),
});
