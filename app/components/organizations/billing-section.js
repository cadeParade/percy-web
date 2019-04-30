import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  subscriptionData: service(),
  organization: null,

  subscription: readOnly('organization.subscription'),
  plan: readOnly('subscription.plan'),

  isUserOrgAdmin: readOnly('organization.currentUserIsAdmin'),

  shouldDisplayUsageStats: computed(
    'organization.billingLocked',
    'subscription.{isTrialOrFree}',
    'plan.{isCustom,hasAmount,isStandardAndNotFree}',
    function() {
      const isStandardPlan = this.plan.isStandardAndNotFree;
      const isCustomWithAmount = this.plan.isCustom && this.plan.hasAmount;
      const isnotLockedOrFree =
        !this.organization.billingLocked && !this.subscription.isTrialOrFree;
      return isStandardPlan || (isCustomWithAmount && isnotLockedOrFree);
    },
  ),
});
