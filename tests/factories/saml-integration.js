import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('saml-integration', {
  default: {
    organization: FactoryGuy.belongsTo('organization'),
    forceSso: false,
    provider: () => 'okta',
    providerLoginUrl() {
      return `${faker.internet.domainWord()}.${faker.internet.domainName()}`;
    },
    emailDomain() {
      return faker.internet.domainName();
    },
  },

  traits: {
    forced: {forceSso: true},
  },
});
