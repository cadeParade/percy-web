import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('plan', {
  default: {
    id: 'free',
    name: 'Free plan',
    interval: 'month',
    intervalCount: 1,
    workerLimit: 2,
    usageIncluded: 500,
    historyLimitDays: 7,
    isTrial: false,
    isFree: true,
  },
  traits: {
    trial: {
      id: 'trial',
      name: 'Test plan (trial)',
      workerLimit: 8,
      usageIncluded: 12000,
      historyLimitDays: 90,
      allowOverages: true,
      overageUnitCost: 0.01,
      isTrial: true,
      isFree: false,
    },

    business: {
      id: 'v2-large',
      name: 'Business',
      monthlyPrice: 849,
      numDiffs: 200000,
      extraDiffPrice: 0.006,
      numTeamMembersTitle: '20 team members',
      numWorkersTitle: '40 concurrent renderers',
      historyLimitTitle: '1 year history',
      isFree: false,
    },

    custom: {
      id: 'very-custom',
      name: 'Custom Plan',
      monthlyPrice: 9999999,
      numDiffs: 9999999,
      extraDiffPrice: 0.00001,
      numTeamMembersTitle: '1000 team members',
      numWorkersTitle: '10000 concurrent renderers',
      historyLimitTitle: '1000 year history',
      isFree: false,
    },
  },
});
