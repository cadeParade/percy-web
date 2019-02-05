import {it, describe, beforeEach} from 'mocha';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';
import {make, makeList} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import ManageUsersList from 'percy-web/tests/pages/components/organizations/manage-users-list';

describe('Integration: ManageUsersList', function() {
  freezeMoment('2018-12-17');

  function rendersAUserCorrectly() {
    it('renders a user correctly', async function() {
      const userCard = ManageUsersList.userCards.objectAt(0);
      expect(userCard.avatarUrl).to.equal(this.organizationUsers[0].user.avatarUrl);
      expect(userCard.userName.isVisible).to.equal(true);
      expect(userCard.joinDate.isVisible).to.equal(true);
      expect(userCard.role).to.equal('Member');
      expect(userCard.buttons.length).to.equal(2);
      expect(userCard.buttons.objectAt(0).text).to.equal('Make admin');
      expect(userCard.buttons.objectAt(1).text).to.equal('Remove');
    });
  }

  function rendersAnInviteCorrectly({isAdmin = true}) {
    it('renders an invite correctly', async function() {
      organization.set('currentUserIsAdmin', isAdmin);
      await this.render(
        hbs`{{organizations/manage-users-list
          organization=organization
          organizationUsers=organizationUsers}}`,
      );

      const inviteCard = ManageUsersList.inviteCards.objectAt(0);
      const invite = this.invites[0];
      expect(inviteCard.email).to.equal(invite.email);
      expect(inviteCard.role).to.equal('Member');
      expect(inviteCard.avatarUrl).to.include('https://www.gravatar.com/avatar/');
      expect(inviteCard.inviteExpiration).to.equal(moment(invite.expiresAt).format('MMM D, Y'));
      expect(inviteCard.inviteDate).to.equal(moment(invite.createdAt).format('MMM D, Y'));
      expect(inviteCard.inviterName).to.equal(invite.fromUser.name);
      expect(inviteCard.copyUrlButton.text).to.equal('Copy invite link');
      expect(inviteCard.cancelButton.text).to.equal('Cancel');
      expect(inviteCard.copyUrlButton.isDisabled).to.equal(!isAdmin);
      expect(inviteCard.cancelButton.isDisabled).to.equal(!isAdmin);

      await percySnapshot(this.test);
    });
  }

  setupRenderingTest('organizations/manage-users-list-test', {
    integration: true,
  });

  let organization;
  let organizationUsers;
  let invites;
  const numberOfUsers = 5;

  beforeEach(function() {
    setupFactoryGuy(this);
    ManageUsersList.setContext(this);
    organization = make('organization');
    organizationUsers = makeList('organization-user', numberOfUsers, {
      organization: organization,
    });
    this.setProperties({
      organization,
      organizationUsers,
    });
    // To prevent an API call and setup for admin tests:
    organization.set('currentUserIsAdmin', true);
  });

  describe('when there are no invites', function() {
    beforeEach(async function() {
      await this.render(
        hbs`{{organizations/manage-users-list
          organization=organization
          organizationUsers=organizationUsers}}`,
      );
    });

    it('renders column headers', function() {
      expect(ManageUsersList.columnHeaders).to.equal('Name Role Joined on');
    });

    it('does not render section headers', function() {
      expect(ManageUsersList.invitesHeader.isVisible).to.equal(false);
      expect(ManageUsersList.usersHeader.isVisible).to.equal(false);
    });

    it('renders all users', function() {
      expect(ManageUsersList.userCards.length).to.equal(numberOfUsers);
    });

    rendersAUserCorrectly();

    it('does not render any invites', function() {
      expect(ManageUsersList.inviteCards.length).to.equal(0);
    });
  });

  describe('when there are invites', function() {
    let numberOfInvites;

    beforeEach(async function() {
      numberOfInvites = 3;
      invites = makeList('invite', numberOfInvites, {
        organization: organization,
      });
      this.setProperties({invites});
      await this.render(
        hbs`{{organizations/manage-users-list
          organization=organization
          organizationUsers=organizationUsers}}`,
      );
    });

    it('renders column headers', function() {
      expect(ManageUsersList.columnHeaders).to.equal('Name Role Joined on');
    });

    it('renders section headers', function() {
      expect(ManageUsersList.invitesHeader.text).to.equal(`${numberOfInvites} pending invitations`);
      expect(ManageUsersList.usersHeader.text).to.equal(`${numberOfUsers} active members`);
    });

    it('renders all users', function() {
      expect(ManageUsersList.userCards.length).to.equal(numberOfUsers);
    });

    rendersAUserCorrectly();

    it('renders all invites', function() {
      expect(ManageUsersList.inviteCards.length).to.equal(numberOfInvites);
    });

    describe('as an admin', function() {
      rendersAnInviteCorrectly({isAdmin: true});
    });

    describe('as a member', function() {
      rendersAnInviteCorrectly({isAdmin: false});
    });
  });
});
