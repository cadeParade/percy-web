import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('payment-method', {
  default: {
    cardBrand: 'Visa',
    cardLast4: '1234',
    cardExpiresAt: () => new Date('2019-03-01'),
    isCard: true,
  },
  traits: {},
});
