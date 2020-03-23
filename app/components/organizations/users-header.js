import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {and, empty, not, or, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';

export default Component.extend({
  intercom: service(),

  shouldIgnoreSeatLimit: empty('organization.seatLimit'),
  shouldEnforceSeatLimit: not('shouldIgnoreSeatLimit'),
  hasSeatsRemaining: readOnly('organization.hasSeatsRemaining'),
  hasNoSeatsRemaining: not('hasSeatsRemaining'),
  isAdmin: readOnly('organization.currentUserIsAdmin'),
  isMember: not('isAdmin'),
  isForceSso: readOnly('organization.samlIntegration.forceSso'),
  isNotForceSso: not('isForceSso'),

  canAddSeats: or('hasSeatsRemaining', 'shouldIgnoreSeatLimit'),
  cannotAddSeats: and('hasNoSeatsRemaining', 'shouldEnforceSeatLimit'),
  disableInviteButton: or('isInviteFormAllowed', 'cannotAddSeats', 'isMember', 'isForceSso'),
  showInviteForm: and('isInviteFormAllowed', 'isAdmin', 'canAddSeats', 'isNotForceSso'),

  canDisplayTooltip: or('cannotAddSeats', 'isMember', 'isForceSso'),
  tooltipText: computed('cannotAddSeats', 'isMember', 'isForceSso', function () {
    if (this.isMember) {
      return 'Only admins can invite new users';
    } else if (this.cannotAddSeats) {
      return 'No seats remaining';
    } else if (this.isForceSso) {
      return 'This organization requires you to be added via your SSO integration.';
    } else {
      return '';
    }
  }),

  actions: {
    showSupport() {
      this.intercom.showIntercom();
    },
  },
});
