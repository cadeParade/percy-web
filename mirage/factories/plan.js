import {Factory, trait} from 'ember-cli-mirage';
import planFixtureData from 'percy-web/tests/helpers/plan-fixture-data';

export default Factory.extend({
  // default values
  id: planFixtureData.standard.id,
  name: planFixtureData.standard.name,
  workerLimit: planFixtureData.standard.workerLimit,
  usageIncluded: planFixtureData.standard.usageIncluded,
  historyLimitDays: planFixtureData.standard.historyLimitDays,
  allowOverages: planFixtureData.standard.allowOverages,
  overageUnitCost: planFixtureData.standard.overageUnitCost,
  isTrial: planFixtureData.standard.isTrial,
  isFree: planFixtureData.standard.isFree,
  isPaid: planFixtureData.standard.isPaid,
  type: planFixtureData.standard.type,

  free: trait(planFixtureData.free),
  trial: trait(planFixtureData.trial),
  standard: trait(planFixtureData.standard),
  custom: trait(planFixtureData.legacy),
  sponsored: trait(planFixtureData.sponsored),
  enterprise: trait(planFixtureData.enterprise),
  legacy: trait(planFixtureData.legacy),
});
