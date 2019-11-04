import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
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
