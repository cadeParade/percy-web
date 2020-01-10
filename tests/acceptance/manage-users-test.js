import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {currentRouteName, currentURL} from '@ember/test-helpers';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';
import {beforeEach, afterEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import ManageUsersList from 'percy-web/tests/pages/components/organizations/manage-users-list';
import UsersHeader from 'percy-web/tests/pages/components/organizations/users-header';
import UsersPage from 'percy-web/tests/pages/organizations/users-page';
import utils from 'percy-web/lib/utils';
import sinon from 'sinon';

describe('Acceptance: ManageUsers', function() {
  freezeMoment('2018-12-17');

  function rendersPageCorrectly() {
    it('renders organization information', async function() {
      const text = `You’ve used ${seatsUsed} of ${seatLimit} seats available.`;

      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(UsersHeader.seatCount.text).to.equal(text);
      expect(UsersHeader.billingLink.isVisible).to.equal(true);
      expect(UsersHeader.supportLink.isVisible).to.equal(true);
      expect(UsersHeader.inviteButton.text).to.equal('Invite new users');
    });

    it('renders all users', async function() {
      const numberOfUsers = 5;
      const users = server.createList('user', numberOfUsers);
      users.forEach((user, i) => {
        const identityCombos = [
          ['githubIdentity'],
          ['auth0Identity'],
          ['oktaIdentity'],
          ['githubIdentity', 'oktaIdentity'],
          ['auth0Identity', 'githubIdentity', 'oktaIdentity'],
        ];
        identityCombos[i].forEach(identityTrait => {
          const identities = [server.create('identity', identityTrait)];
          user.update({identities: user.identities.models.concat(identities)});
        });
        server.create('organizationUser', {user, organization});
      });
      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.users.index');
      expect(ManageUsersList.userCards.length).to.equal(numberOfUsers + 1);
      await percySnapshot(this.test);
    });

    it('renders all invites', async function() {
      await UsersPage.visitUsersPage({orgSlug: organization.slug});

      expect(currentRouteName()).to.equal('organizations.organization.users.index');
      expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites);
    });
  }

  setupAcceptance();
  let organization;
  let seatsUsed;
  let seatLimit;
  let seatsRemaining;
  let adminUser;
  let numberOfInvites;
  let confirmationAlertStub;

  describe('when currentUser is an Admin', function() {
    setupSession(function(server) {
      seatsUsed = 3;
      seatLimit = 10;
      seatsRemaining = 10;
      numberOfInvites = 2;
      // using 'withPaidPlan' to avoid a trial expiration error in the snapshots
      organization = server.create('organization', 'withPaidPlan', {
        seatsUsed,
        seatLimit,
        seatsRemaining,
        name: 'Meow Mediaworks',
      });
      adminUser = server.create('user');
      server.create('organizationUser', {
        organization,
        user: adminUser,
        role: 'admin',
      });
      server.createList('invite', numberOfInvites, {
        organization,
        fromUser: adminUser,
      });
    });

    beforeEach(function() {
      confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
    });

    afterEach(function() {
      confirmationAlertStub.restore();
    });

    rendersPageCorrectly();

    it('cancelling an invite removes it from the page', async function() {
      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites);
      await ManageUsersList.inviteCards.objectAt(0).cancelButton.click();
      expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites - 1);
      await percySnapshot(this.test.fullTitle());
    });

    it('removing a user removes it from the page', async function() {
      let user = server.create('user');
      server.create('organizationUser', {organization, user: user});

      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(ManageUsersList.userCards.length).to.equal(2);

      await ManageUsersList.userCards
        .objectAt(1)
        .buttons.objectAt(1)
        .click();
      expect(ManageUsersList.userCards.length).to.equal(1);
      await percySnapshot(this.test.fullTitle());
    });

    describe('leaving organization', function() {
      it('redirects user to an organization.index page ', async function() {
        const otherOrganization = server.create('organization', 'withPaidPlan');
        server.create('organizationUser', {
          organization: otherOrganization,
          user: adminUser,
          role: 'admin',
        });
        await UsersPage.visitUsersPage({orgSlug: organization.slug});

        expect(ManageUsersList.userCards.objectAt(0).buttons.objectAt(0).text).to.equal(
          'Leave organization',
        );
        await ManageUsersList.userCards
          .objectAt(0)
          .buttons.objectAt(0)
          .click();

        expect(currentRouteName()).to.equal('organizations.organization.projects.new');
        expect(currentURL()).not.to.include(organization.slug);
        expect(currentURL()).to.include(otherOrganization.slug);
        await percySnapshot(this.test.fullTitle());
      });

      it('redirects to organization.new when it is in no other organizations', async function() {
        await UsersPage.visitUsersPage({orgSlug: organization.slug});

        expect(ManageUsersList.userCards.objectAt(0).buttons.objectAt(0).text).to.equal(
          'Leave organization',
        );
        await ManageUsersList.userCards
          .objectAt(0)
          .buttons.objectAt(0)
          .click();

        expect(currentRouteName()).to.equal('organizations.new');
        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('when seats are available', function() {
      it('inviting a user adds it to the page', async function() {
        await UsersPage.visitUsersPage({orgSlug: organization.slug});
        expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites);

        await UsersHeader.inviteButton.click();
        expect(currentRouteName()).to.equal('organizations.organization.users.invite');
        await UsersHeader.enterEmails('test@example.com');
        await percySnapshot(this.test.fullTitle());

        await UsersHeader.sendInvitesButton.click();

        expect(currentRouteName()).to.equal('organizations.organization.users.index');
        expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites + 1);
        await percySnapshot(`${this.test.fullTitle()} - #2`);
      });

      it('cancelling from the invite form returns user to users route', async function() {
        await UsersPage.visitUsersPage({orgSlug: organization.slug});
        expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites);
        await UsersHeader.inviteButton.click();
        expect(currentRouteName()).to.equal('organizations.organization.users.invite');

        await UsersHeader.cancelButton.click();

        expect(currentRouteName()).to.equal('organizations.organization.users.index');
        await percySnapshot(this.test.fullTitle());
      });

      it('visiting the invite page shows the invite form', async function() {
        await UsersPage.visitInvitePage({orgSlug: organization.slug});

        expect(UsersHeader.inviteForm.isVisible).to.equal(true);
      });
    });

    describe('when organization has no seatLimit', async function() {
      it('does not display seat usage text', async function() {
        organization.seatLimit = null;

        await UsersPage.visitInvitePage({orgSlug: organization.slug});

        expect(UsersHeader.seatCount.isVisible).to.equal(false);
        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('on the /invite page when seats are unavailable', function() {
      it('invite form is hidden', async function() {
        organization.seatsRemaining = 0;

        await UsersPage.visitInvitePage({orgSlug: organization.slug});

        expect(UsersHeader.inviteForm.isVisible).to.equal(false);
        expect(UsersHeader.formError.isVisible).to.equal(true);
        await percySnapshot(this.test.fullTitle());
      });
    });
  });

  describe('when currentUser is a Member', function() {
    setupSession(function(server) {
      organization = server.create('organization', 'withPaidPlan', 'withUser');
    });

    describe('on the /invite page', function() {
      it('invite form is hidden', async function() {
        await UsersPage.visitInvitePage({orgSlug: organization.slug});

        expect(UsersHeader.inviteForm.isVisible).to.equal(false);
        expect(UsersHeader.formError.isVisible).to.equal(true);
        await percySnapshot(this.test.fullTitle());
      });
    });
  });
});
