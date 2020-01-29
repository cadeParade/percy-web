import {computed} from '@ember/object';
import {bool, not, notEmpty, or, filterBy, gt, mapBy, readOnly, uniq} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import {
  INTEGRATION_TYPES,
  SLACK_INTEGRATION_TYPE,
  OKTA_INTEGRATION_TYPE,
} from 'percy-web/lib/integration-types';
import {inject as service} from '@ember/service';
import {isUserAdminOfOrg} from 'percy-web/lib/is-user-member-of-org';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const DISPLAY_NAMES = {
  bitbucketCloud: 'Bitbucket Cloud',
  github: 'GitHub',
  githubEnterprise: 'GitHub Enterprise',
  gitlab: 'GitLab',
  gitlabSelfHosted: 'GitLab Self-Managed',
};

export default Model.extend(LoadableModel, {
  session: service(),
  name: attr(),
  slug: attr(),
  isSyncing: attr(),
  lastSyncedAt: attr(),
  slackIntegrations: hasMany('slackIntegrations', {async: false}),
  versionControlIntegrations: hasMany('version-control-integrations', {async: false}),
  samlIntegration: belongsTo('samlIntegration', {async: false}),
  invites: hasMany('invite'),
  usageNotificationSetting: belongsTo('usageNotificationSetting', {async: false}),

  bitbucketCloudIntegration: computed(
    'versionControlIntegrations.@each.bitbucketCloudIntegrationId',
    function() {
      return this.versionControlIntegrations.findBy('isBitbucketCloudIntegration');
    },
  ),

  githubIntegration: computed('versionControlIntegrations.@each.githubIntegrationId', function() {
    return this.versionControlIntegrations.findBy('isGithubIntegration');
  }),

  githubEnterpriseIntegration: computed(
    'versionControlIntegrations.@each.githubEnterpriseIntegrationId',
    function() {
      return this.versionControlIntegrations.findBy('githubEnterpriseIntegrationId');
    },
  ),

  gitlabIntegration: computed('versionControlIntegrations.@each.gitlabIntegrationId', function() {
    return this.versionControlIntegrations.findBy('gitlabIntegrationId');
  }),

  gitlabSelfHostedIntegration: computed('versionControlIntegrations.@each.gitlabHost', function() {
    return this.versionControlIntegrations.findBy('gitlabHost');
  }),

  githubIntegrationRequest: belongsTo('github-integration-request', {
    async: false,
  }),
  subscription: belongsTo('subscription', {async: false}),
  projects: hasMany('project'),
  billingProvider: attr(),
  billingProviderData: attr(),
  billingLocked: attr('boolean'),

  // Filtered down to saved projects, does not include unsaved project objects:
  savedProjects: filterBy('projects', 'isNew', false),

  organizationUsers: hasMany('organization-user'),

  seatLimit: attr(),
  seatsUsed: attr(),
  seatsRemaining: attr(),
  hasSeatsRemaining: gt('seatsRemaining', 0),

  isSponsored: attr(),

  // These are GitHub repositories that the organization has access permissions to. These are not
  // useful on their own other than for listing. A repo must be linked to a project.
  repos: hasMany('repo'),

  isBitbucketCloudIntegrated: bool('bitbucketCloudIntegration'),
  isGithubIntegrated: bool('githubIntegration'),
  isGithubEnterpriseIntegrated: bool('githubEnterpriseIntegration'),
  isGitlabIntegrated: bool('gitlabIntegration'),
  isGitlabSelfHostedIntegrated: bool('gitlabSelfHostedIntegration'),
  isVersionControlIntegrated: bool('versionControlIntegrations.length'),
  isIntegrated: or('isVersionControlIntegrated', 'isSlackIntegrated', 'isOktaIntegrated'),
  isSlackIntegrated: gt('slackIntegrations.length', 0),
  isNotSlackIntegrated: not('isSlackIntegrated'),
  isSamlIntegrated: notEmpty('samlIntegration'),
  isNotSamlIntegrated: not('isSamlIntegrated'),
  isOktaIntegrated: readOnly('samlIntegration.isOktaIntegration'),
  isNotOktaIntegrated: not('isOktaIntegrated'),

  availableIntegrations: computed('versionControlIntegrations.[]', function() {
    let integrations = [];
    for (const key of Object.keys(INTEGRATION_TYPES)) {
      let item = INTEGRATION_TYPES[key];
      if (key == SLACK_INTEGRATION_TYPE || key == OKTA_INTEGRATION_TYPE) {
        continue;
      }
      if (this.get(`${item.organizationIntegrationStatus}`) != true) {
        integrations.push(key);
      }
    }
    return integrations;
  }),

  githubAuthMechanism: computed('githubIntegration', function() {
    if (this.githubIntegration) {
      return 'github-integration';
    }
    return 'no-access';
  }),

  // Not ideal to have computed properties based on a service and relationships,
  // but better than previous async computed property.
  currentUserIsAdmin: computed('session.currentUser', function() {
    return isUserAdminOfOrg(this.session.currentUser, this);
  }),

  bitbucketCloudRepos: filterBy('repos', 'source', 'bitbucket_cloud'),
  githubRepos: filterBy('repos', 'source', 'github'),
  githubEnterpriseRepos: filterBy('repos', 'source', 'github_enterprise'),
  gitlabRepos: filterBy('repos', 'source', 'gitlab'),
  gitlabSelfHostedRepos: filterBy('repos', 'source', 'gitlab_self_hosted'),
  repoSources: mapBy('repos', 'source'),
  uniqueRepoSources: uniq('repoSources'),

  // Return repos grouped by source:
  // groupedRepos: [
  //   { groupName: 'GitHub', options: [repo:model, repo:model, ...] },
  //   { groupName: 'GitHub Enterprise', options: [repo:model, repo:model, ...] },
  // ]
  groupedRepos: computed(
    'bitbucketCloudRepos.[]',
    'githubRepos.[]',
    'githubEnterpriseRepos.[]',
    'gitlabRepos.[]',
    'gitlabSelfHostedRepos.[]',
    'uniqueRepoSources.[]',
    function() {
      const groups = [];
      this.uniqueRepoSources.forEach(source => {
        if (source) {
          const displayName = source.camelize();
          const reposForGroup = this.get(`${displayName}Repos`);
          if (reposForGroup) {
            groups.push({
              groupName: DISPLAY_NAMES[displayName],
              options: this.get(`${displayName}Repos`),
            });
          }
        }
      });
      return groups;
    },
  ),
});
