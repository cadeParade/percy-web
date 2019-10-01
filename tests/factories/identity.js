import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('identity', {
  default: {
    user: FactoryGuy.belongsTo('user'),
    uid: faker.random.number(),
  },

  traits: {
    githubProvider: {
      provider: 'github',
    },
    auth0Provider: {
      provider: 'auth0',
    },
    oktaProvider: {
      provider: `samlp|okta-${faker.lorem.slug()}`,
      uid: () => faker.internet.email(),
    },
  },
});
