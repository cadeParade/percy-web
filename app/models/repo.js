import {equal, or} from '@ember/object/computed';
import Model, {attr} from '@ember-data/model';
import {
  BITBUCKET_CLOUD_INTEGRATION_TYPE,
  GITHUB_INTEGRATION_TYPE,
  GITHUB_ENTERPRISE_INTEGRATION_TYPE,
  GITLAB_INTEGRATION_TYPE,
  GITLAB_SELF_HOSTED_INTEGRATION_TYPE,
} from 'percy-web/lib/integration-types';

export default Model.extend({
  name: attr(),
  slug: attr(),
  hostname: attr(),
  source: attr(),
  htmlUrl: attr(),

  isBitbucketCloudRepo: equal('source', BITBUCKET_CLOUD_INTEGRATION_TYPE),
  isGithubRepo: equal('source', GITHUB_INTEGRATION_TYPE),
  isGithubEnterpriseRepo: equal('source', GITHUB_ENTERPRISE_INTEGRATION_TYPE),
  isGithubRepoFamily: or('isGithubRepo', 'isGithubEnterpriseRepo'),
  isGitlabRepo: equal('source', GITLAB_INTEGRATION_TYPE),
  isGitlabSelfHostedRepo: equal('source', GITLAB_SELF_HOSTED_INTEGRATION_TYPE),
  isGitlabRepoFamily: or('isGitlabRepo', 'isGitlabSelfHostedRepo'),
});
