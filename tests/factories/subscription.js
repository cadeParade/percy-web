import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';
import moment from 'moment';

FactoryGuy.define('subscription', {
  default: {
    organization: FactoryGuy.belongsTo('organization'),
    plan: FactoryGuy.belongsTo('plan'),
    paymentMethod: FactoryGuy.belongsTo('payment-method'),
    billingEmail: () => faker.internet.email(),
  },
  traits: {
    withBusinessPlan: {
      plan: FactoryGuy.belongsTo('plan', 'business'),
    },
    withCustomPlan: {
      plan: FactoryGuy.belongsTo('plan', 'custom'),
    },
    withFreePlan: {
      plan: FactoryGuy.belongsTo('plan', 'free'),
    },
    withSponsoredPlan: {
      plan: FactoryGuy.belongsTo('plan', 'sponsored'),
    },
    withTrialPlan: {
      plan: FactoryGuy.belongsTo('plan', 'trial'),
      trialEnd: () => new moment().add(7, 'days'),
    },
    withPaidPlan: {
      plan: FactoryGuy.belongsTo('plan', 'standard'),
    },
    withLegacyPlan: {
      plan: FactoryGuy.belongsTo('plan', 'legacy'),
    },
    withEnterprisePlan: {
      plan: FactoryGuy.belongsTo('plan', 'enterprise'),
    },
    withNoPaymentMethod: {
      paymentMethod: null,
    },
  },
});
