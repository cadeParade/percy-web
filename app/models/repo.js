import {or, equal} from '@ember/object/computed';
import Model, {attr} from '@ember-data/model';
import {
  BITBUCKET_CLOUD_INTEGRATION_TYPE,
  GITHUB_INTEGRATION_TYPE,
  GITHUB_ENTERPRISE_INTEGRATION_TYPE,
  GITLAB_INTEGRATION_TYPE,
  GITLAB_SELF_HOSTED_INTEGRATION_TYPE,
} from 'percy-web/lib/integration-types';

export default class Repo extends Model {
  @attr()
  name;

  @attr()
  slug;

  @attr()
  hostname;

  @attr()
  source;

  @attr()
  htmlUrl;

  @equal('source', BITBUCKET_CLOUD_INTEGRATION_TYPE)
  isBitbucketCloudRepo;

  @equal('source', GITHUB_INTEGRATION_TYPE)
  isGithubRepo;

  @equal('source', GITHUB_ENTERPRISE_INTEGRATION_TYPE)
  isGithubEnterpriseRepo;

  @or('isGithubRepo', 'isGithubEnterpriseRepo')
  isGithubRepoFamily;

  @equal('source', GITLAB_INTEGRATION_TYPE)
  isGitlabRepo;

  @equal('source', GITLAB_SELF_HOSTED_INTEGRATION_TYPE)
  isGitlabSelfHostedRepo;

  @or('isGitlabRepo', 'isGitlabSelfHostedRepo')
  isGitlabRepoFamily;
}
