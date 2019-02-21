import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: function() {
    const users = this.registry.schema.db.users;
    if (users.length === 0) {
      return [];
    } else {
      return [
        'subscription',
        'versionControlIntegrations',
        'subscription.currentUsageStats',
        'githubIntegrationRequest',
        'githubIntegrationRequest.createdBy',
        'usageNotificationSetting',
      ];
    }
  },

  links(organization) {
    return {
      projects: {
        related: `/api/v1/organizations/${organization.slug}/projects`,
      },
      organizationUsers: {
        related: `/api/v1/organizations/${organization.slug}/organization-users`,
      },
    };
  },
});
