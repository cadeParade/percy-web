import {Factory, association} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  organization: association(),
  isEnabled: true,
  emails() {
    return [faker.internet.email(), faker.internet.email()];
  },
  thresholds() {
    return {
      'snapshot-count': ['10', '200', '3000'],
    };
  },
});
