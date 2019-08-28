import Component from '@ember/component';
import isUserMemberPromise from 'percy-web/lib/is-user-member-of-org';
import {computed} from '@ember/object';
import {task} from 'ember-concurrency';
import {bool, equal, readOnly} from '@ember/object/computed';

export default Component.extend({
  tagName: '',
  organization: null,

  // _isUserMember.value will be null if the task has not completed or
  // the value if the task has completed. So depending on this property
  // in the template will block rendering until it is resolved AND true.
  showNoticeBar: bool('_isUserMember.value'),

  isSubscriptionFree: readOnly('organization.subscription.isFree'),
  isSubscriptionTrial: readOnly('organization.subscription.isTrial'),
  currentUsagePercentage: readOnly('organization.subscription.currentUsagePercentage'),
  hasRemainingSnapshots: bool('organization.subscription.hasIncludedSnapshotsRemaining'),
  trialDaysRemaining: readOnly('organization.subscription.trialDaysRemaining'),
  isTrialEndingToday: equal('trialDaysRemaining', 0),

  _isUserMember: computed('organization', function() {
    return this._getIsUserMember.perform(this.organization);
  }),

  _getIsUserMember: task(function*(org) {
    return yield isUserMemberPromise(org);
  }),
});
