import {computed} from '@ember/object';
import {equal, gt, not, or} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import DS from 'ember-data';

const SPONSORED_TYPE = 'sponsored';

// The `id` field on this model actually corresponds to the `stripe_id` field in the db model.
export default DS.Model.extend({
  subscriptionData: service(),

  name: DS.attr(),
  amount: DS.attr('number'),
  workerLimit: DS.attr('number'),
  usageIncluded: DS.attr('number'),
  historyLimitDays: DS.attr('number'),
  allowOverages: DS.attr('boolean'),
  overageUnitCost: DS.attr('number'),
  userLimit: DS.attr('number'),
  isDeprecated: DS.attr('boolean'),
  // According to the API, this is true for plans with `trial_period_days` present.
  isTrial: DS.attr('boolean'),
  // This should be true ONLY for the free plan with ID free.
  // It will not be true for trial plans or sponsored plans.
  isFree: DS.attr('boolean'),
  // This is true if the plan is not-free && not-trial && not-sponsored && not-demo.
  isPaid: DS.attr('boolean'),
  type: DS.attr(),

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
