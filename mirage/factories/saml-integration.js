import {Factory, association, trait} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  organization: association(),
  provider: 'okta',
  providerLoginUrl() {
    return faker.internet.url();
  },
  emailDomain() {
    return faker.internet.domainName();
  },

  okta: trait({provider: 'okta'}),
  forced: trait({forceSso: true}),
});
