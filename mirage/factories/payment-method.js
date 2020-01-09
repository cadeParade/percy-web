import {Factory} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  cardBrand: 'Visa',
  cardLast4: '1234',
  cardExpiresAt: () => faker.date.future(),
  isCard: true,
});
