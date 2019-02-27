import {inject as service} from '@ember/service';
import {alias, lt, not, or, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import DS from 'ember-data';
import moment from 'moment';

export default DS.Model.extend({
  organization: DS.belongsTo('organization', {async: false}),
  plan: DS.belongsTo('plan', {async: false}),
  billingEmail: DS.attr(),
  currentUsageStats: DS.belongsTo('usage-stat', {async: false}),
  status: DS.attr(),
  currentPeriodStart: DS.attr('date'),
  currentPeriodEnd: DS.attr('date'),
  currentPeriodEndDisplayed: computed('currentPeriodEnd', function() {
    const currentPeriodEnd = this.get('currentPeriodEnd');
    return (
      currentPeriodEnd &&
      moment(currentPeriodEnd)
        .subtract(1, 'day')
        .toDate()
    );
  }),
  trialStart: DS.attr('date'),
  trialEnd: DS.attr('date'),
  isTrial: alias('plan.isTrial'),
  isFree: alias('plan.isFree'),
  isTrialOrFree: or('plan.isTrial', 'plan.isFree'),
  isCustomer: not('isTrialOrFree'), // this includes sponsored plans
  isPaid: readOnly('plan.isPaid'),

  // This is only here so that ember-data will send the token on create, it will never be populated
  // in API responses.
  token: DS.attr(),

  subscriptionData: service(),
  trialDaysRemaining: computed('trialEnd', function() {
    return Math.round(moment(this.get('trialEnd')).diff(moment(), 'days', true));
  }),
  currentUsageRatio: DS.attr(),
  currentUsagePercentage: computed('currentUsageRatio', function() {
    const percentage = parseFloat(this.get('currentUsageRatio')) * 100;
    return percentage < 1 ? Math.ceil(percentage) : Math.floor(percentage);
  }),
  hasIncludedSnapshotsRemaining: lt('currentUsageRatio', 1),
});
