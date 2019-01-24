import {Factory, trait} from 'ember-cli-mirage';

export default Factory.extend({
  id: 'v3-small',
  name: 'Essential plan',
  workerLimit: 16,
  usageIncluded: 5000,
  historyLimitDays: 360,
  allowOverages: true,
  overageUnitCost: 0.006,
  isTrial: false,
  isFree: false,
  type: 'self_serve',

  free: trait({
    id: 'free',
    name: 'Free plan',
    interval: 'month',
    intervalCount: 1,
    workerLimit: 2,
    usageIncluded: 500,
    historyLimitDays: 7,
    isTrial: false,
    isFree: true,
    type: 'trial',
  }),

  trial: trait({
    id: 'v2-medium-trial',
    name: 'Test plan (trial)',
    workerLimit: 8,
    usageIncluded: 12000,
    historyLimitDays: 90,
    allowOverages: true,
    overageUnitCost: 0.01,
    isTrial: true,
    isFree: false,
    type: 'trial',
  }),

  standard: trait({
    id: 'v3-small',
    name: 'Essential plan',
    workerLimit: 16,
    usageIncluded: 5000,
    historyLimitDays: 360,
    allowOverages: true,
    overageUnitCost: 0.006,
    isTrial: false,
    isFree: false,
    type: 'self_serve',
  }),

  custom: trait({
    id: 'custom',
    name: 'Custom plan',
    workerLimit: 1000,
    usageIncluded: 10000000,
    historyLimitDays: 900,
    allowOverages: true,
    overageUnitCost: 0.01,
    isTrial: false,
    isFree: false,
    type: 'custom',
  }),

  sponsored: trait({
    id: 'sponsored',
    name: 'Sponsored plan',
    workerLimit: 100,
    usageIncluded: 1000,
    historyLimitDays: 100,
    allowOverages: false,
    overageUnitCost: 0.01,
    isTrial: false,
    isFree: false,
    type: 'sponsored',
  }),
});
