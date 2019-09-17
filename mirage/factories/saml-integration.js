import {Factory, association} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  organization: association(),
  provider: 'okta',
  providerLoginUrl() {
    return `${faker.internet.domainWord()}.${faker.internet.domainName()}`;
  },
  emailDomain() {
    return faker.internet.domainName();
  },
});
