import {Factory, association} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  organization: association(),
  teamName() {
    return faker.company.companyName();
  },
  channelName() {
    return `#${faker.lorem.slug()}`;
  },
});
