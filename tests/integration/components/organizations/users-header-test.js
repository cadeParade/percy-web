import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import {setupRenderingTest} from 'ember-mocha';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import UsersHeader from 'percy-web/tests/pages/components/organizations/users-header';
import {make} from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import {render} from '@ember/test-helpers';

describe('Integration: UsersHeader', function() {
  setupRenderingTest('organizations/users-header-test', {
    integration: true,
  });

  let organization;
  const seatsUsed = 3;
  const seatLimit = 10;

  beforeEach(function() {
    setupFactoryGuy(this);
    UsersHeader.setContext(this);
    organization = make('organization', {
      name: 'Meow Mediaworks',
      hasSeatsRemaining: true,
      seatLimit,
      seatsUsed,
    });
    this.setProperties({isInviteFormAllowed: false, organization});
  });

  describe('when user is admin', function() {
    beforeEach(async function() {
      organization.set('currentUserIsAdmin', true);
    });

    it('displays basic information', async function() {
      await render(hbs`{{organizations/users-header
        organization=organization
        isInviteFormAllowed=isInviteFormAllowed
      }}`);

      const text = `You’ve used ${seatsUsed} of ${seatLimit} seats available.`;
      expect(UsersHeader.seatCount.text).to.equal(text);
      expect(UsersHeader.billingLink.isVisible).to.equal(true);
      expect(UsersHeader.supportLink.isVisible).to.equal(true);
      expect(UsersHeader.inviteButton.text).to.equal('Invite new users');

      await percySnapshot(this.test);
    });

    describe('when isInviteFormAllowed=false', function() {
      beforeEach(async function() {
        this.set('isInviteFormAllowed', false);
      });

      describe('when seats are available', function() {
        beforeEach(async function() {
          organization.set('hasSeatsRemaining', true);
          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=isInviteFormAllowed
          }}`);
        });

        it('form is hidden & button is enabled', async function() {
          expect(UsersHeader.inviteButton.isDisabled).to.equal(false);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(false);
          expect(UsersHeader.inviteForm.isVisible).to.equal(false);

          await percySnapshot(this.test);
        });
      });

      describe('when seats are unavailable', function() {
        beforeEach(function() {
          organization.set('hasSeatsRemaining', false);
        });

        it('form is hidden & button is disabled', async function() {
          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=isInviteFormAllowed
          }}`);

          expect(UsersHeader.inviteButton.isDisabled).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.label).to.equal('No seats remaining');
          expect(UsersHeader.inviteForm.isVisible).to.equal(false);

          await percySnapshot(this.test);
        });
      });

      describe('when seatLimit is null', function() {
        it('form and usage text are hidden & button is enabled', async function() {
          organization.set('seatLimit', null);

          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=isInviteFormAllowed
          }}`);

          expect(UsersHeader.seatCount.isVisible).to.equal(false);
          expect(UsersHeader.billingLink.isVisible).to.equal(false);
          expect(UsersHeader.inviteButton.isDisabled).to.equal(false);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(false);
          expect(UsersHeader.inviteForm.isVisible).to.equal(false);

          await percySnapshot(this.test);
        });
      });
    });

    describe('when isInviteFormAllowed=true', function() {
      beforeEach(async function() {
        this.set('isInviteFormAllowed', true);
      });

      describe('when seats are available', function() {
        beforeEach(async function() {
          organization.set('hasSeatsRemaining', true);
          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=isInviteFormAllowed
          }}`);
        });

        it('button is disabled & form is displayed', async function() {
          expect(UsersHeader.inviteButton.isDisabled).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(false);
          expect(UsersHeader.inviteForm.isVisible).to.equal(true);

          await percySnapshot(this.test);
        });
      });

      describe('when seats are unavailable', function() {
        beforeEach(async function() {
          organization.set('seatLimit', 3);
          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=isInviteFormAllowed
          }}`);
        });

        it('button is disabled & form is hidden', async function() {
          expect(UsersHeader.inviteButton.isDisabled).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.label).to.equal('No seats remaining');
          expect(UsersHeader.inviteForm.isVisible).to.equal(false);
          expect(UsersHeader.formError.isVisible).to.equal(true);

          await percySnapshot(this.test);
        });
      });

      describe('when seatLimit is null', function() {
        it('button is disabled & form is displayed', async function() {
          organization.set('seatLimit', null);

          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=isInviteFormAllowed
          }}`);

          expect(UsersHeader.inviteButton.isDisabled).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(false);
          expect(UsersHeader.inviteForm.isVisible).to.equal(true);

          await percySnapshot(this.test);
        });
      });
    });
  });

  describe('when user is member', function() {
    beforeEach(async function() {
      organization.set('currentUserIsAdmin', false);
    });
    const tooltipText = 'Only admins can invite new users';

    describe('when isInviteFormAllowed=false', function() {
      describe('when seats are available', function() {
        beforeEach(async function() {
          organization.set('hasSeatsRemaining', true);
          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=false
          }}`);
        });

        it('form is hidden & button is disabled', async function() {
          expect(UsersHeader.inviteButton.isDisabled).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.label).to.equal(tooltipText);
          expect(UsersHeader.inviteForm.isVisible).to.equal(false);

          await percySnapshot(this.test);
        });
      });
    });

    describe('when isInviteFormAllowed=true', function() {
      describe('when seats are available', function() {
        beforeEach(async function() {
          organization.set('hasSeatsRemaining', true);
          await render(hbs`{{organizations/users-header
            organization=organization
            isInviteFormAllowed=true
          }}`);
        });

        it('button is disabled & form is hidden', async function() {
          expect(UsersHeader.inviteButton.isDisabled).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.isActive).to.equal(true);
          expect(UsersHeader.inviteButtonTooltip.label).to.equal(tooltipText);
          expect(UsersHeader.inviteForm.isVisible).to.equal(false);
          expect(UsersHeader.formError.isVisible).to.equal(true);

          await percySnapshot(this.test);
        });
      });
    });
  });
});
