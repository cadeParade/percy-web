import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {and, empty, not, or, readOnly} from '@ember/object/computed';

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

  actions: {
    showSupport() {
      this.get('intercom').showIntercom();
    },
  },
});
