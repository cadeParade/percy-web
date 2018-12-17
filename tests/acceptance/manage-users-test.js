import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {currentRouteName} from '@ember/test-helpers';
import {beforeEach, afterEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import ManageUsersList from 'percy-web/tests/pages/components/organizations/manage-users-list';
import UsersHeader from 'percy-web/tests/pages/components/organizations/users-header';
import UsersPage from 'percy-web/tests/pages/users-page';
import utils from 'percy-web/lib/utils';
import sinon from 'sinon';

describe('Acceptance: ManageUsers', function() {
  function rendersPageCorrectly() {
    it('renders organization information', async function() {
      const text = `You’ve used ${seatsUsed} of ${seatLimit} seats available.`;

      await UsersPage.visitUsersPage({orgSlug: organization.slug});

      expect(UsersHeader.organizationName).to.equal(organizationName);
      expect(UsersHeader.seatCount.text).to.equal(text);
      expect(UsersHeader.billingLink.isVisible).to.equal(true);
      expect(UsersHeader.supportLink.isVisible).to.equal(true);
      expect(UsersHeader.inviteButton.text).to.equal('Invite new users');
    });

    it('renders all users', async function() {
      const numberOfUsers = 5;
      const users = server.createList('user', numberOfUsers);
      users.forEach(user => {
        server.create('organizationUser', {user, organization});
      });

      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.users.index');
      expect(ManageUsersList.userCards().count).to.equal(numberOfUsers + 1);
    });

    it('renders all invites', async function() {
      await UsersPage.visitUsersPage({orgSlug: organization.slug});

      expect(currentRouteName()).to.equal('organizations.organization.users.index');
      expect(ManageUsersList.inviteCards().count).to.equal(numberOfInvites);
    });
  }

  setupAcceptance();
  let organization;
  let organizationName;
  let seatsUsed;
  let seatLimit;
  let seatsRemaining;
  let adminUser;
  let numberOfInvites;
  let confirmationAlertStub;

  setupSession(function(server) {
    organizationName = 'Meow Mediaworks';
    seatsUsed = 3;
    seatLimit = 10;
    seatsRemaining = 10;
    numberOfInvites = 2;
    // using 'withSponsoredSubscription' to avoid a trial expiration error in the snapshots
    organization = server.create('organization', 'withSponsoredSubscription', {
      seatsUsed,
      seatLimit,
      seatsRemaining,
      name: organizationName,
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

  describe('when currentUser is an Admin', function() {
    beforeEach(function() {
      confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
    });

    afterEach(function() {
      confirmationAlertStub.restore();
    });

    rendersPageCorrectly();

    it('cancelling an invite removes it from the page', async function() {
      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(ManageUsersList.inviteCards().count).to.equal(numberOfInvites);
      await ManageUsersList.inviteCards(0).cancelButton.click();
      expect(ManageUsersList.inviteCards().count).to.equal(numberOfInvites - 1);
      await percySnapshot(this.test.fullTitle());
    });

    it('removing a user removes it from the page', async function() {
      let user = server.create('user');
      server.create('organizationUser', {organization, user: user});

      await UsersPage.visitUsersPage({orgSlug: organization.slug});
      expect(ManageUsersList.userCards().count).to.equal(2);

      await ManageUsersList.userCards(1)
        .buttons(1)
        .click();
      expect(ManageUsersList.userCards().count).to.equal(1);
      await percySnapshot(this.test.fullTitle());
    });

    describe('when seats are available', function() {
      it('inviting a user adds it to the page', async function() {
        await UsersPage.visitUsersPage({orgSlug: organization.slug});
        expect(ManageUsersList.inviteCards().count).to.equal(numberOfInvites);

        await UsersHeader.inviteButton.click();
        expect(currentRouteName()).to.equal('organizations.organization.users.invite');
        await UsersHeader.enterEmails('test@example.com');
        await percySnapshot(this.test.fullTitle());

        await UsersHeader.sendInvitesButton.click();

        expect(currentRouteName()).to.equal('organizations.organization.users.index');
        expect(ManageUsersList.inviteCards().count).to.equal(numberOfInvites + 1);
        await percySnapshot(this.test.fullTitle());
      });

      it('cancelling from the invite form returns user to users route', async function() {
        await UsersPage.visitUsersPage({orgSlug: organization.slug});
        expect(ManageUsersList.inviteCards().count).to.equal(numberOfInvites);
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
  });
});
