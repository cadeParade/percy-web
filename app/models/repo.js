import {equal, or} from '@ember/object/computed';
import DS from 'ember-data';
import {
  BITBUCKET_CLOUD_INTEGRATION_TYPE,
  GITHUB_INTEGRATION_TYPE,
  GITHUB_ENTERPRISE_INTEGRATION_TYPE,
  GITLAB_INTEGRATION_TYPE,
  GITLAB_SELF_HOSTED_INTEGRATION_TYPE,
} from 'percy-web/lib/integration-types';

export default DS.Model.extend({
  externalRepoId: DS.attr('number'),
  name: DS.attr(),
  slug: DS.attr(),
  hostname: DS.attr(),
  source: DS.attr(),
  htmlUrl: DS.attr(),
  isPrivate: DS.attr('boolean'),
  description: DS.attr(),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  isBitbucketCloudRepo: equal('source', BITBUCKET_CLOUD_INTEGRATION_TYPE),
  isGithubRepo: equal('source', GITHUB_INTEGRATION_TYPE),
  isGithubEnterpriseRepo: equal('source', GITHUB_ENTERPRISE_INTEGRATION_TYPE),
  isGithubRepoFamily: or('isGithubRepo', 'isGithubEnterpriseRepo'),
  isGitlabRepo: equal('source', GITLAB_INTEGRATION_TYPE),
  isGitlabSelfHostedRepo: equal('source', GITLAB_SELF_HOSTED_INTEGRATION_TYPE),
  isGitlabRepoFamily: or('isGitlabRepo', 'isGitlabSelfHostedRepo'),
});
