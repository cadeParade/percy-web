import FactoryGuy from 'ember-data-factory-guy';
import planFixtureData from 'percy-web/tests/helpers/plan-fixture-data';

FactoryGuy.define('plan', {
  polymorphic: false,
  default: planFixtureData.business,

  traits: {
    free: planFixtureData.free,
    trial: planFixtureData.trial,
    standard: planFixtureData.standard,
    business: planFixtureData.business,
    custom: planFixtureData.legacy,
    sponsored: planFixtureData.sponsored,
    enterprise: planFixtureData.enterprise,
    githubMarketplace: planFixtureData.githubMarketplace,
    legacy: planFixtureData.legacy,
  },
});
