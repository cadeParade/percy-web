import {Factory, trait, association} from 'ember-cli-mirage';
import moment from 'moment';

export default Factory.extend({
  email(i) {
    return `user-${i}@domain.com`;
  },
  name(i) {
    return `Fake User With Good Hair ${i}`;
  },
  avatarUrl() {
    return 'https://avatars2.githubusercontent.com/u/12261879?v=3&s=400';
  },
  createdAt() {
    return moment();
  },

  withGithubIdentity: trait({
    afterCreate(user, server) {
      server.create('identity', 'githubIdentity', {user});
    },
  }),

  withAuth0Identity: trait({
    afterCreate(user, server) {
      server.create('identity', 'auth0Identity', {user});
    },
  }),

  withUserNotificationSetting: trait({
    userNotificationSetting: association(),
  }),
});
