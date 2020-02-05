import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {readOnly, not, lt, and} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';
import moment from 'moment';

export default class Subscription extends Model {
  @belongsTo('organization', {async: false})
  organization;

  @belongsTo('plan', {async: false})
  plan;

  @belongsTo('payment-method', {async: false})
  paymentMethod;

  @attr()
  billingEmail;

  @belongsTo('usage-stat', {async: false})
  currentUsageStats;

  @attr()
  status;

  @attr('date')
  currentPeriodStart;

  @attr('date')
  currentPeriodEnd;

  @computed('currentPeriodEnd')
  get currentPeriodEndDisplayed() {
    const currentPeriodEnd = this.currentPeriodEnd;
    return (
      currentPeriodEnd &&
      moment(currentPeriodEnd)
        .subtract(1, 'day')
        .toDate()
    );
  }

  @attr('date')
  trialStart;

  @attr('date')
  trialEnd;

  @readOnly('plan.isTrial')
  isTrial;

  @readOnly('plan.isFree')
  isFree;

  @readOnly('plan.isTrialOrFree')
  isTrialOrFree;

  @not('isTrialOrFree')
  isCustomer; // this includes sponsored plans

  @readOnly('plan.isPaid')
  isPaid;

  @readOnly('plan.isSponsored')
  isSponsored;

  // This is only here so that ember-data will send the token on create, it will never be populated
  // in API responses.
  @attr()
  token;

  @service
  subscriptionData;

  @computed('trialEnd')
  get trialDaysRemaining() {
    return Math.round(moment(this.trialEnd).diff(moment(), 'days', true));
  }

  @attr()
  currentUsageRatio;

  @computed('currentUsageRatio')
  get currentUsagePercentage() {
    const percentage = parseFloat(this.currentUsageRatio) * 100;
    return percentage < 1 ? Math.ceil(percentage) : Math.floor(percentage);
  }

  @lt('currentUsageRatio', 1)
  hasIncludedSnapshotsRemaining;

  @and('isCustomer', 'plan.isNotSponsored')
  hasCreditCard;
}
