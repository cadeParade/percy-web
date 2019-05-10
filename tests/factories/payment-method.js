import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('payment-method', {
  default: {
    cardBrand: 'Visa',
    cardLast4: '1234',
    cardExpiresAt: () => faker.date.future(),
    isCard: true,
  },
  traits: {},
});
