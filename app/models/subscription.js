import {inject as service} from '@ember/service';
import {and, lt, not, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import Model, {attr, belongsTo} from '@ember-data/model';
import moment from 'moment';

export default Model.extend({
  organization: belongsTo('organization', {async: false}),
  plan: belongsTo('plan', {async: false}),
  paymentMethod: belongsTo('payment-method', {async: false}),
  billingEmail: attr(),
  currentUsageStats: belongsTo('usage-stat', {async: false}),
  status: attr(),
  currentPeriodStart: attr('date'),
  currentPeriodEnd: attr('date'),
  currentPeriodEndDisplayed: computed('currentPeriodEnd', function() {
    const currentPeriodEnd = this.currentPeriodEnd;
    return (
      currentPeriodEnd &&
      moment(currentPeriodEnd)
        .subtract(1, 'day')
        .toDate()
    );
  }),
  trialStart: attr('date'),
  trialEnd: attr('date'),
  isTrial: readOnly('plan.isTrial'),
  isFree: readOnly('plan.isFree'),
  isTrialOrFree: readOnly('plan.isTrialOrFree'),
  isCustomer: not('isTrialOrFree'), // this includes sponsored plans
  isPaid: readOnly('plan.isPaid'),
  isSponsored: readOnly('plan.isSponsored'),

  // This is only here so that ember-data will send the token on create, it will never be populated
  // in API responses.
  token: attr(),

  subscriptionData: service(),
  trialDaysRemaining: computed('trialEnd', function() {
    return Math.round(moment(this.trialEnd).diff(moment(), 'days', true));
  }),
  currentUsageRatio: attr(),
  currentUsagePercentage: computed('currentUsageRatio', function() {
    const percentage = parseFloat(this.currentUsageRatio) * 100;
    return percentage < 1 ? Math.ceil(percentage) : Math.floor(percentage);
  }),
  hasIncludedSnapshotsRemaining: lt('currentUsageRatio', 1),
  hasCreditCard: and('isCustomer', 'plan.isNotSponsored'),
});
