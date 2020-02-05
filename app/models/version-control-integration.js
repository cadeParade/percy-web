import {computed} from '@ember/object';
import {equal} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';
import {
  BITBUCKET_CLOUD_INTEGRATION_TYPE,
  GITHUB_INTEGRATION_TYPE,
  GITHUB_ENTERPRISE_INTEGRATION_TYPE,
  GITLAB_INTEGRATION_TYPE,
  GITLAB_SELF_HOSTED_INTEGRATION_TYPE,
  INTEGRATION_TYPES,
} from 'percy-web/lib/integration-types';

export default class VersionControlIntegration extends Model {
  @belongsTo('organization')
  organization;

  @attr()
  integrationType;

  @attr()
  bitbucketCloudClientKey;

  @attr()
  githubInstallationId;

  @attr()
  githubHtmlUrl;

  @attr()
  githubEnterpriseInstallationId;

  @attr()
  githubEnterpriseIntegrationId;

  @attr()
  gitlabIntegrationId;

  @attr()
  gitlabHost;

  @attr()
  gitlabPersonalAccessToken;

  @attr('boolean')
  isGitlabPersonalAccessTokenPresent;

  @attr()
  status;

  @attr()
  isSyncing;

  @attr()
  lastUpdatedAt;

  @equal('integrationType', BITBUCKET_CLOUD_INTEGRATION_TYPE)
  isBitbucketCloudIntegration;

  @equal('integrationType', GITHUB_INTEGRATION_TYPE)
  isGithubIntegration;

  @equal('integrationType', GITHUB_ENTERPRISE_INTEGRATION_TYPE)
  isGithubEnterpriseIntegration;

  @equal('integrationType', GITLAB_INTEGRATION_TYPE)
  isGitlabIntegration;

  @equal('integrationType', GITLAB_SELF_HOSTED_INTEGRATION_TYPE)
  isGitlabSelfHostedIntegration;

  @computed('integrationType')
  get friendlyName() {
    let integrationType = this.integrationType;
    if (integrationType) {
      let integrationItem = INTEGRATION_TYPES[integrationType];
      if (integrationItem) {
        return integrationItem['textName'];
      }
    }
    return '';
  }
}
