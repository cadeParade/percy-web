import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';
import moment from 'moment';

FactoryGuy.define('invite', {
  default: {
    email: () => faker.internet.email(),
    fromUser: FactoryGuy.belongsTo('user'),
    organization: FactoryGuy.belongsTo('organization'),
    createdAt: () => new moment(),
    updatedAt: () => new moment(),
    expiresAt: () => new moment().add(7, 'days'),
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
