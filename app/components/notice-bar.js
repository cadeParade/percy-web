import Component from '@ember/component';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {computed} from '@ember/object';
import {bool, equal, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',
  session: service(),
  organization: null,

  isSubscriptionFree: readOnly('organization.subscription.isFree'),
  isSubscriptionTrial: readOnly('organization.subscription.isTrial'),
  currentUsagePercentage: readOnly('organization.subscription.currentUsagePercentage'),
  hasRemainingSnapshots: bool('organization.subscription.hasIncludedSnapshotsRemaining'),
  trialDaysRemaining: readOnly('organization.subscription.trialDaysRemaining'),
  isTrialEndingToday: equal('trialDaysRemaining', 0),

  showNoticeBar: computed('organization', 'session.currentUser', function() {
    return isUserMember(this.session.currentUser, this.organization);
  }),
});
