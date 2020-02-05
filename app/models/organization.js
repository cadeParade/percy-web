import classic from 'ember-classic-decorator';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {uniq, readOnly, mapBy, gt, filterBy, or, notEmpty, not, bool} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import {
  INTEGRATION_TYPES,
  SLACK_INTEGRATION_TYPE,
  OKTA_INTEGRATION_TYPE,
} from 'percy-web/lib/integration-types';
import {isUserAdminOfOrg} from 'percy-web/lib/is-user-member-of-org';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const DISPLAY_NAMES = {
  bitbucketCloud: 'Bitbucket Cloud',
  github: 'GitHub',
  githubEnterprise: 'GitHub Enterprise',
  gitlab: 'GitLab',
  gitlabSelfHosted: 'GitLab Self-Managed',
};

// Remove @classic when we can refactor away from mixins
@classic
export default class Organization extends Model.extend(LoadableModel) {
  @service
  session;

  @attr()
  name;

  @attr()
  slug;

  @attr()
  isSyncing;

  @attr()
  lastSyncedAt;

  @hasMany('slackIntegrations', {async: false})
  slackIntegrations;

  @hasMany('version-control-integrations', {async: false})
  versionControlIntegrations;

  @belongsTo('samlIntegration', {async: false})
  samlIntegration;

  @hasMany('invite')
  invites;

  @belongsTo('usageNotificationSetting', {async: false})
  usageNotificationSetting;

  @computed('versionControlIntegrations.@each.bitbucketCloudIntegrationId')
  get bitbucketCloudIntegration() {
    return this.versionControlIntegrations.findBy('isBitbucketCloudIntegration');
  }

  @computed('versionControlIntegrations.@each.githubIntegrationId')
  get githubIntegration() {
    return this.versionControlIntegrations.findBy('isGithubIntegration');
  }

  @computed('versionControlIntegrations.@each.githubEnterpriseIntegrationId')
  get githubEnterpriseIntegration() {
    return this.versionControlIntegrations.findBy('githubEnterpriseIntegrationId');
  }

  @computed('versionControlIntegrations.@each.gitlabIntegrationId')
  get gitlabIntegration() {
    return this.versionControlIntegrations.findBy('gitlabIntegrationId');
  }

  @computed('versionControlIntegrations.@each.gitlabHost')
  get gitlabSelfHostedIntegration() {
    return this.versionControlIntegrations.findBy('gitlabHost');
  }

  @belongsTo('github-integration-request', {
    async: false,
  })
  githubIntegrationRequest;

  @belongsTo('subscription', {async: false})
  subscription;

  @hasMany('project')
  projects;

  @attr()
  billingProvider;

  @attr()
  billingProviderData;

  @attr('boolean')
  billingLocked;

  // Filtered down to saved projects, does not include unsaved project objects:
  @filterBy('projects', 'isNew', false)
  savedProjects;

  @hasMany('organization-user')
  organizationUsers;

  @attr()
  seatLimit;

  @attr()
  seatsUsed;

  @attr()
  seatsRemaining;

  @gt('seatsRemaining', 0)
  hasSeatsRemaining;

  @attr()
  isSponsored;

  // These are GitHub repositories that the organization has access permissions to. These are not
  // useful on their own other than for listing. A repo must be linked to a project.
  @hasMany('repo')
  repos;

  @bool('bitbucketCloudIntegration')
  isBitbucketCloudIntegrated;

  @bool('githubIntegration')
  isGithubIntegrated;

  @bool('githubEnterpriseIntegration')
  isGithubEnterpriseIntegrated;

  @bool('gitlabIntegration')
  isGitlabIntegrated;

  @bool('gitlabSelfHostedIntegration')
  isGitlabSelfHostedIntegrated;

  @bool('versionControlIntegrations.length')
  isVersionControlIntegrated;

  @or('isVersionControlIntegrated', 'isSlackIntegrated', 'isOktaIntegrated')
  isIntegrated;

  @gt('slackIntegrations.length', 0)
  isSlackIntegrated;

  @not('isSlackIntegrated')
  isNotSlackIntegrated;

  @notEmpty('samlIntegration')
  isSamlIntegrated;

  @not('isSamlIntegrated')
  isNotSamlIntegrated;

  @readOnly('samlIntegration.isOktaIntegration')
  isOktaIntegrated;

  @not('isOktaIntegrated')
  isNotOktaIntegrated;

  @computed('versionControlIntegrations.[]')
  get availableIntegrations() {
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
  }

  @computed('githubIntegration')
  get githubAuthMechanism() {
    if (this.githubIntegration) {
      return 'github-integration';
    }
    return 'no-access';
  }

  // Not ideal to have computed properties based on a service and relationships,
  // but better than previous async computed property.
  @computed('session.currentUser')
  get currentUserIsAdmin() {
    return isUserAdminOfOrg(this.session.currentUser, this);
  }

  @filterBy('repos', 'source', 'bitbucket_cloud')
  bitbucketCloudRepos;

  @filterBy('repos', 'source', 'github')
  githubRepos;

  @filterBy('repos', 'source', 'github_enterprise')
  githubEnterpriseRepos;

  @filterBy('repos', 'source', 'gitlab')
  gitlabRepos;

  @filterBy('repos', 'source', 'gitlab_self_hosted')
  gitlabSelfHostedRepos;

  @mapBy('repos', 'source')
  repoSources;

  @uniq('repoSources')
  uniqueRepoSources;

  // Return repos grouped by source:
  // groupedRepos: [
  //   { groupName: 'GitHub', options: [repo:model, repo:model, ...] },
  //   { groupName: 'GitHub Enterprise', options: [repo:model, repo:model, ...] },
  // ]
  @computed(
    'bitbucketCloudRepos.[]',
    'githubRepos.[]',
    'githubEnterpriseRepos.[]',
    'gitlabRepos.[]',
    'gitlabSelfHostedRepos.[]',
    'uniqueRepoSources.[]',
  )
  get groupedRepos() {
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
  }
}
