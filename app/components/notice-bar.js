import Component from '@ember/component';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {computed} from '@ember/object';
import {bool, equal, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import diffAttrs from 'ember-diff-attrs';

export default Component.extend({
  tagName: '',
  session: service(),
  store: service(),
  organization: null,
  subscription: null,

  isSubscriptionFree: readOnly('subscription.isFree'),
  isSubscriptionTrial: readOnly('subscription.isTrial'),
  currentUsagePercentage: readOnly('subscription.currentUsagePercentage'),
  hasRemainingSnapshots: bool('subscription.hasIncludedSnapshotsRemaining'),
  trialDaysRemaining: readOnly('subscription.trialDaysRemaining'),
  isTrialEndingToday: equal('trialDaysRemaining', 0),

  showNoticeBar: computed('organization', 'session.currentUser', function () {
    return isUserMember(this.session.currentUser, this.organization);
  }),

  fetchOrgWithSubscription: task(function* (organization) {
    if (!this.showNoticeBar) return;

    let plan;
    const subscription = organization.belongsTo('subscription').value();
    if (subscription) {
      plan = subscription.belongsTo('plan').value();
    }

    if (subscription && plan) {
      this.setProperties({subscription});
    } else {
      const orgWithSubscription = yield organization.sideload('subscription.plan');
      this.setProperties({subscription: orgWithSubscription.subscription});
    }
  }),

  didReceiveAttrs: diffAttrs('organization', function (changedAttrs) {
    this._super(...arguments);

    if (changedAttrs && changedAttrs.organization) {
      this.fetchOrgWithSubscription.perform(this.organization);
    }
  }),

  didInsertElement() {
    this._super(...arguments);
    this.fetchOrgWithSubscription.perform(this.organization);
  },
});
