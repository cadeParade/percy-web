import FactoryGuy from 'ember-data-factory-guy';

const BUSINESS_PLAN_ATTRIBUTES = {
  id: 'v3-large',
  name: 'Business',
  monthlyPrice: 849,
  numDiffs: 200000,
  extraDiffPrice: 0.006,
  numTeamMembersTitle: '20 team members',
  historyLimitTitle: '1 year history',
  isFree: false,
  isPaid: true,
  type: 'self_serve',
};

FactoryGuy.define('plan', {
  polymorphic: false,
  default: BUSINESS_PLAN_ATTRIBUTES,

  traits: {
    trial: {
      id: 'v2-medium-trial',
      name: 'Test plan (trial)',
      workerLimit: 8,
      usageIncluded: 12000,
      historyLimitDays: 90,
      allowOverages: true,
      overageUnitCost: 0.01,
      isTrial: true,
      isFree: false,
      isPaid: false,
      type: 'trial',
    },

    business: BUSINESS_PLAN_ATTRIBUTES,

    custom: {
      id: 'very-custom',
      name: 'Custom Plan',
      monthlyPrice: 9999999,
      numDiffs: 9999999,
      extraDiffPrice: 0.00001,
      numTeamMembersTitle: '1000 team members',
      historyLimitTitle: '1000 year history',
      isTriale: false,
      isFree: false,
      isPaid: true,
      type: 'enterprise',
    },

    free: {
      id: 'free',
      name: 'Free plan',
      interval: 'month',
      intervalCount: 1,
      workerLimit: 2,
      usageIncluded: 500,
      historyLimitDays: 7,
      isTrial: false,
      isFree: true,
      isPaid: false,
      type: 'trial',
    },

    sponsored: {
      id: 'hella-sponsored',
      name: 'Sponsored Plan',
      monthlyPrice: 9999999,
      numDiffs: 9999999,
      extraDiffPrice: 0.00001,
      numTeamMembersTitle: '1000 team members',
      historyLimitTitle: '1000 year history',
      isFree: false,
      isPaid: false,
      type: 'sponsored',
    },
  },
});
