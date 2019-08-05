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

  canAddSeats: or('hasSeatsRemaining', 'shouldIgnoreSeatLimit'),
  cannotAddSeats: and('hasNoSeatsRemaining', 'shouldEnforceSeatLimit'),
  disableInviteButton: or('isInviteFormAllowed', 'cannotAddSeats', 'isMember'),
  showInviteForm: and('isInviteFormAllowed', 'isAdmin', 'canAddSeats'),

  canDisplayTooltip: or('cannotAddSeats', 'isMember'),
  tooltipText: computed('cannotAddSeats', 'isMember', function() {
    if (this.isMember) {
      return 'Only admins can invite new users';
    } else {
      return 'No seats remaining';
    }
  }),

  actions: {
    showSupport() {
      this.intercom.showIntercom();
    },
  },
});
