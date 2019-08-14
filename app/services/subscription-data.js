/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import Service from '@ember/service';

// The data in this file is for deciding how to display plans on the
// billing page and also the pricing page. The values should be the same, but some of the props on
// these objects have labels included.

export const DEFAULT_PLAN_ID = 'v3-small';

export const PLAN_DATA = {
  PLAN_IDS: ['free', 'v3-small', 'v3-medium', 'v3-large'],
  UPGRADEABLE_PLAN_IDS: [
    'free',
    'v2-medium-trial',
    'v3-small',
    'v3-medium',
    'v3-large',
    'v2a-small',
    'v2a-medium',
    'v2a-large',
    'v2-small',
    'v2-medium',
    'v2-large',
    'v1-small',
    'v1-medium',
    'v1-pro',
    'medium',
    'large',
  ],
  PLANS: [
    {
      id: 'free',
      name: 'Free',
      amount: 0,
      usageIncluded: 5000,
      numTeamMembersTitle: '10 team members',
      historyLimitTitle: '30 day history',
    },
    {
      id: 'v3-small',
      name: 'Small',
      amount: 29,
      usageIncluded: 10000,
      overageUnitCost: 0.006,
      numTeamMembersTitle: 'Unlimited team members',
      historyLimitTitle: '1 year history',
    },
    {
      id: 'v3-medium',
      name: 'Medium',
      amount: 349,
      usageIncluded: 80000,
      overageUnitCost: 0.006,
      numTeamMembersTitle: 'Unlimited team members',
      historyLimitTitle: '1 year history',
    },
    {
      id: 'v3-large',
      name: 'Large',
      amount: 849,
      usageIncluded: 200000,
      overageUnitCost: 0.006,
      numTeamMembersTitle: 'Unlimited team members',
      historyLimitTitle: '1 year history',
    },
  ],
};

export default Service.extend(PLAN_DATA);
