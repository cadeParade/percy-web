import {computed} from '@ember/object';
import {equal, gt, not, or} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import Model, {attr} from '@ember-data/model';

const SPONSORED_TYPE = 'sponsored';

// The `id` field on this model actually corresponds to the `stripe_id` field in the db model.
export default Model.extend({
  subscriptionData: service(),

  name: attr(),
  amount: attr('number'),
  workerLimit: attr('number'),
  usageIncluded: attr('number'),
  historyLimitDays: attr('number'),
  allowOverages: attr('boolean'),
  overageUnitCost: attr('number'),
  userLimit: attr('number'),
  isDeprecated: attr('boolean'),
  // According to the API, this is true for plans with `trial_period_days` present.
  isTrial: attr('boolean'),
  // This should be true ONLY for the free plan with ID free.
  // It will not be true for trial plans or sponsored plans.
  isFree: attr('boolean'),
  // This is true if the plan is not-free && not-trial && not-sponsored && not-demo.
  isPaid: attr('boolean'),
  type: attr(),

  hasAmount: gt('amount', 0),
  isNotTrial: not('isTrial'),
  isNotFree: not('isFree'),
  isTrialOrFree: or('isFree', 'isTrial'),
  isSponsored: equal('type', SPONSORED_TYPE),
  isNotSponsored: not('isSponsored'),

  // This should exclude legacy paid plans and enterprise plans.
  isCurrentPaidPlan: computed('id', function() {
    return this.subscriptionData.PLAN_IDS.includes(this.id) && this.isNotFree;
  }),

  isUpgradeable: computed('id', function() {
    return this.subscriptionData.UPGRADEABLE_PLAN_IDS.includes(this.id);
  }),
});
