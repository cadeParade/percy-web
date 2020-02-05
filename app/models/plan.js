import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {or, not, gt, equal} from '@ember/object/computed';
import Model, {attr} from '@ember-data/model';

const SPONSORED_TYPE = 'sponsored';

// The `id` field on this model actually corresponds to the `stripe_id` field in the db model.
export default class Plan extends Model {
  @service
  subscriptionData;

  @attr()
  name;

  @attr('number')
  amount;

  @attr('number')
  workerLimit;

  @attr('number')
  usageIncluded;

  @attr('number')
  historyLimitDays;

  @attr('boolean')
  allowOverages;

  @attr('number')
  overageUnitCost;

  @attr('number')
  userLimit;

  @attr('boolean')
  isDeprecated;

  // According to the API, this is true for plans with `trial_period_days` present.
  @attr('boolean')
  isTrial;

  // This should be true ONLY for the free plan with ID free.
  // It will not be true for trial plans or sponsored plans.
  @attr('boolean')
  isFree;

  // This is true if the plan is not-free && not-trial && not-sponsored && not-demo.
  @attr('boolean')
  isPaid;

  @attr()
  type;

  @gt('amount', 0)
  hasAmount;

  @not('isTrial')
  isNotTrial;

  @not('isFree')
  isNotFree;

  @or('isFree', 'isTrial')
  isTrialOrFree;

  @equal('type', SPONSORED_TYPE)
  isSponsored;

  @not('isSponsored')
  isNotSponsored;

  // This should exclude legacy paid plans and enterprise plans.
  @computed('id')
  get isCurrentPaidPlan() {
    return this.subscriptionData.PLAN_IDS.includes(this.id) && this.isNotFree;
  }

  @computed('id')
  get isUpgradeable() {
    return this.subscriptionData.UPGRADEABLE_PLAN_IDS.includes(this.id);
  }
}
