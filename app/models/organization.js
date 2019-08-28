import {computed} from '@ember/object';
import {bool, not, or, filterBy, gt, mapBy, readOnly, uniq} from '@ember/object/computed';
import DS from 'ember-data';
import {INTEGRATION_TYPES, SLACK_INTEGRATION_TYPE} from 'percy-web/lib/integration-types';
import {inject as service} from '@ember/service';
import {isUserAdminOfOrg} from 'percy-web/lib/is-user-member-of-org';

const DISPLAY_NAMES = {
  bitbucketCloud: 'Bitbucket Cloud',
  github: 'GitHub',
  githubEnterprise: 'GitHub Enterprise',
  gitlab: 'GitLab',
  gitlabSelfHosted: 'GitLab Self-Managed',
};

export default DS.Model.extend({
  session: service(),
  name: DS.attr(),
  slug: DS.attr(),
  isSyncing: DS.attr(),
  lastSyncedAt: DS.attr(),
  slackIntegrations: DS.hasMany('slackIntegrations', {async: false}),
  versionControlIntegrations: DS.hasMany('version-control-integrations', {
    async: false,
  }),
  invites: DS.hasMany('invite'),
  usageNotificationSetting: DS.belongsTo('usageNotificationSetting', {async: false}),

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

  githubIntegrationRequest: DS.belongsTo('github-integration-request', {
    async: false,
  }),
  subscription: DS.belongsTo('subscription', {async: false}),
  projects: DS.hasMany('project'),
  billingProvider: DS.attr(),
  billingProviderData: DS.attr(),
  billingLocked: DS.attr('boolean'),

  // Filtered down to saved projects, does not include unsaved project objects:
  savedProjects: filterBy('projects', 'isNew', false),

  organizationUsers: DS.hasMany('organization-user'),

  seatLimit: DS.attr(),
  seatsUsed: DS.attr(),
  seatsRemaining: DS.attr(),
  hasSeatsRemaining: gt('seatsRemaining', 0),

  // These are GitHub repositories that the organization has access permissions to. These are not
  // useful on their own other than for listing. A repo must be linked to a project.
  repos: DS.hasMany('repo'),

  isBitbucketCloudIntegrated: bool('bitbucketCloudIntegration'),
  isGithubIntegrated: bool('githubIntegration'),
  isGithubEnterpriseIntegrated: bool('githubEnterpriseIntegration'),
  isGitlabIntegrated: bool('gitlabIntegration'),
  isGitlabSelfHostedIntegrated: bool('gitlabSelfHostedIntegration'),
  isVersionControlIntegrated: bool('versionControlIntegrations.length'),
  isIntegrated: or('isVersionControlIntegrated', 'isSlackIntegrated'),
  isSlackIntegrated: gt('slackIntegrations.length', 0),
  isNotSlackIntegrated: not('isSlackIntegrated'),
  availableIntegrations: computed('versionControlIntegrations.[]', function() {
    let integrations = [];
    for (const key of Object.keys(INTEGRATION_TYPES)) {
      let item = INTEGRATION_TYPES[key];
      if (key == SLACK_INTEGRATION_TYPE) {
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

  isSponsored: readOnly('subscription.plan.isSponsored'),
});
