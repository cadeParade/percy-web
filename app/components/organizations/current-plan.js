import Component from '@ember/component';
import {computed} from '@ember/object';
import {and, or, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  intercom: service(),

  subscription: readOnly('organization.subscription'),
  plan: readOnly('subscription.plan'),

  shouldShowMonthlyCost: readOnly('plan.hasAmount'),
  _isDeprecatedWithAmount: and('plan.isDeprecated', 'plan.hasAmount'),
  shouldDisplayUsageStats: or('plan.isCurrentPaidPlan', '_isDeprecatedWithAmount'),
  shouldShowOverageInfo: and('plan.allowOverages', 'plan.overageUnitCost', 'plan.isNotTrial'),

  displayAmount: computed('plan.amount', function() {
    return this.plan.amount / 100;
  }),

  actions: {
    showIntercom() {
      this.intercom.showIntercom();
    },
  },
});
