import {Factory, trait} from 'ember-cli-mirage';

export default Factory.extend({
  name(i) {
    return `My Organization That I Love And Cherish ${i}`;
  },
  slug() {
    return this.name.underscore();
  },

  afterCreate(organization, server) {
    if (!organization.subscription) {
      server.create('subscription', {organization: organization});
    }
  },

  withTrialPlan: trait({
    afterCreate(organization, server) {
      server.create('subscription', 'withTrialPlan', {organization});
    },
  }),

  withFreePlan: trait({
    afterCreate(organization, server) {
      server.create('subscription', 'withFreePlan', {organization});
    },
  }),

  withSponsoredSubscription: trait({
    afterCreate(organization, server) {
      server.create('subscription', 'withSponsoredPlan', {organization});
    },
  }),

  withUser: trait({
    afterCreate(organization, server) {
      let user = server.create('user', 'withGithubIdentity');
      server.create('organizationUser', {user, organization, role: 'member'});
    },
  }),

  withNonGithubUser: trait({
    afterCreate(organization, server) {
      let user = server.create('user');
      server.create('organizationUser', {user, organization, role: 'member'});
    },
  }),

  withAdminUser: trait({
    afterCreate(organization, server) {
      let user = server.create('user');
      server.create('organizationUser', {user, organization, role: 'admin'});
    },
  }),

  withAdminGithubUser: trait({
    afterCreate(organization, server) {
      let user = server.create('user', 'withGithubIdentity');
      server.create('organizationUser', {user, organization, role: 'admin'});
    },
  }),

  withGithubIntegration: trait({
    afterCreate(organization, server) {
      server.create('versionControlIntegration', 'github', {organization});
    },
  }),

  withGitlabIntegration: trait({
    afterCreate(organization, server) {
      server.create('versionControlIntegration', 'gitlab', {organization});
    },
  }),

  withGitlabSelfHostedIntegration: trait({
    afterCreate(organization, server) {
      server.create('versionControlIntegration', 'gitlabSelfHosted', {organization});
    },
  }),
});
