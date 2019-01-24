import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('subscription', {
  default: {
    organization: FactoryGuy.belongsTo('organization'),
    plan: FactoryGuy.belongsTo('plan'),
    billingEmail: () => {
      faker.internet.email();
    },
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
    },
  },
});
