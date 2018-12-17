import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('invite', {
  default: {
    email: () => faker.internet.email(),
    fromUser: FactoryGuy.belongsTo('user'),
    organization: FactoryGuy.belongsTo('organization'),
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
    expiresAt: () =>
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
    inviteLink: 'http://dev.percy.local:4200/join/fake_invite_code',
    role: 'member',
  },
  traits: {
    adminInvite: {
      role: 'admin',
    },
    memberInvite: {
      role: 'member',
    },
  },
});
