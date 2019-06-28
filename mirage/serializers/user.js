import {JSONAPISerializer} from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: Object.freeze(['identities', 'userNotificationSetting']),
  links() {
    return {
      organizations: {
        related: '/api/v1/user/organizations',
      },
      identities: {
        related: '/api/v1/user/identities',
      },
    };
  },
});
