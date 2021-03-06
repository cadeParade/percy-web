import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';
import {make, makeList} from 'ember-data-factory-guy';
import moment from 'moment';

FactoryGuy.define('organization', {
  default: {
    name: () => faker.company.companyName(),
    slug: f => faker.helpers.slugify(f.name),

    projects: FactoryGuy.hasMany('project'),
    versionControlIntegrations: FactoryGuy.hasMany('version-control-integration'),
    repos: FactoryGuy.hasMany('repo'),
    organizationUsers: FactoryGuy.hasMany('organization-user'),
    lastSyncedAt: () => {
      return moment().subtract(11, 'minutes');
    },
    isSyncing: () => {
      return false;
    },
  },
  traits: {
    new: {
      name: null,
      slug: null,
      projects: null,
      versionControlIntegrations: null,
      repos: null,
      lastSyncedAt: null,
      isSyncing: null,
    },

    fromGithub: {
      billingProvider: 'github_marketplace',
      billingProviderData: JSON.stringify({
        marketplace_listing_plan_id: 9,
      }),
    },

    billingLocked: {
      billingLocked: true,
    },

    withGithubIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['github']);
      },
      repos: () => {
        return makeList('repo', 2, 'github');
      },
    },
    withGithubEnterpriseIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['githubEnterprise']);
      },
      repos: () => {
        return makeList('repo', 2, 'githubEnterprise');
      },
    },
    withGitlabIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['gitlab']);
      },
      repos: () => {
        return makeList('repo', 2, 'gitlab');
      },
    },
    withUnauthorizedGitlabIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['gitlab'], 'unauthorized');
      },
    },
    withInvalidHostnameGitlabSelfHostedIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['gitlabSelfHosted'], 'invalidHostname');
      },
    },
    withNewGitlabIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['newGitlab']);
      },
    },
    withGitlabSelfHostedIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['gitlabSelfHosted']);
      },
      repos: () => {
        return makeList('repo', 2, 'gitlabSelfHosted');
      },
    },
    withNewGitlabSelfHostedIntegration: {
      versionControlIntegrations: () => {
        return makeList('version-control-integration', ['newGitlabSelfHosted']);
      },
    },
    withSlackIntegration: {
      slackIntegrations: FactoryGuy.hasMany('slack-integration', 1),
    },
    withMultipleIntegrations: {
      versionControlIntegrations: () => {
        return makeList(
          'version-control-integration',
          'github',
          'gitlab',
          'gitlabSelfHosted',
          'githubEnterprise',
        );
      },
      repos: () => {
        return makeList('repo', 'github', 'gitlab', 'gitlabSelfHosted', [
          'githubEnterprise',
          {hostname: 'foo.com'},
        ]);
      },
    },
    withStaleRepoData: {
      lastSyncedAt: () => {
        return moment().subtract(20, 'minutes');
      },
      isSyncing: () => {
        return false;
      },
    },
    withFreshRepoData: {
      lastSyncedAt: () => {
        return moment().subtract(1, 'minute');
      },
      isSyncing: () => {
        return false;
      },
    },
    withRepos: {repos: () => makeList('repo', 3)},
    withGithubRepos: {repos: () => makeList('repo', 3, 'github')},
    withGitlabRepos: {repos: () => makeList('repo', 3, 'gitlab')},
    withGitlabSelfHostedRepos: {repos: () => makeList('repo', 3, 'gitlabSelfHosted')},
    withGithubEnterpriseRepos: {repos: () => makeList('repo', 3, 'githubEnterprise')},
    withProjects: {projects: () => makeList('project', 5)},
    withSponsoredPlan: {
      isSponsored: true,
      subscription: () => make('subscription', 'withSponsoredPlan'),
    },
    withFreePlan: {subscription: () => make('subscription', 'withFreePlan')},
    withTrialPlan: {subscription: () => make('subscription', 'withTrialPlan')},
    withPaidPlan: {subscription: () => make('subscription', 'withPaidPlan')},
    withBusinessPlan: {subscription: () => make('subscription', 'withBusinessPlan')},
    withEnterprisePlan: {subscription: () => make('subscription', 'withEnterprisePlan')},
    withLegacyPlan: {subscription: () => make('subscription', 'withLegacyPlan')},
    withUsageNotificationSetting: {
      usageNotificationSetting: () => make('usage-notification-setting'),
    },
    withNoPaymentMethod: {
      subscription: () => make('subscription', 'withEnterprisePlan', 'withNoPaymentMethod'),
    },
    withUsers: {
      organizationUsers: () => makeList('organization-user', 5),
    },

    withAdminUser: {
      organizationUsers: () => {
        const orgUsers = makeList('organization-user', 1, 'adminUser');
        const user = orgUsers.firstObject.user;
        user.set('organizationUsers', [orgUsers.firstObject]);
        return orgUsers;
      },
    },
  },
});
