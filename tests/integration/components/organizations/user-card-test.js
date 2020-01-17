import {it, describe, beforeEach, afterEach} from 'mocha';
import {render, find} from '@ember/test-helpers';
import percySnapshot from '@percy/ember';
import {make} from 'ember-data-factory-guy';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import utils from 'percy-web/lib/utils';
import UserCard from 'percy-web/tests/pages/components/organizations/user-card';
import stubSession from 'percy-web/tests/helpers/stub-session';
import stubService from 'percy-web/tests/helpers/stub-service-integration';

describe('Integration: UserCard', function() {
  setupRenderingTest('organizations/user-card-test', {
    integration: true,
  });

  let organization;
  let adminOrganizationUser;
  let memberOrganizationUser;
  let otherAdminOrganizationUser;
  let otherMemberOrganizationUser;
  let adminUser;
  let memberUser;
  let otherAdminUser;
  let otherMemberUser;

  beforeEach(function() {
    setupFactoryGuy(this);
    organization = make('organization');
    adminUser = make('user');
    otherAdminUser = make('user');
    memberUser = make('user');
    otherMemberUser = make('user');
    adminOrganizationUser = make('organization-user', 'adminUser', {
      organization: organization,
      user: adminUser,
    });
    otherAdminOrganizationUser = make('organization-user', 'adminUser', {
      organization: organization,
      user: otherAdminUser,
    });
    memberOrganizationUser = make('organization-user', {
      organization: organization,
      user: memberUser,
    });
    otherMemberOrganizationUser = make('organization-user', {
      organization: organization,
      user: otherMemberUser,
    });
    adminUser.set('organizationUsers', [adminOrganizationUser]);
    otherAdminUser.set('organizationUsers', [otherMemberOrganizationUser]);
    memberUser.set('organizationUsers', [memberOrganizationUser]);
    otherMemberUser.set('organizationUsers', [otherMemberOrganizationUser]);
    this.setProperties({
      adminOrganizationUser,
      memberOrganizationUser,
      otherAdminOrganizationUser,
      otherMemberOrganizationUser,
    });
  });

  describe('appearance', function() {
    describe('as an admin user', function() {
      beforeEach(function() {
        stubSession(this, {currentUser: adminUser});
      });

      it('renders your Admin user', async function() {
        await render(hbs`<Organizations::UserCard
          @organizationUser={{adminOrganizationUser}}
          @isViewerAdmin={{true}}
        />`);

        expect(UserCard.avatarUrl).to.equal(this.adminOrganizationUser.user.avatarUrl);
        expect(UserCard.userName.isVisible).to.equal(true);
        expect(UserCard.joinDate.isVisible).to.equal(true);
        expect(UserCard.role).to.equal('Administrator');
        expect(UserCard.buttons.length).to.equal(1);
        expect(UserCard.buttons.objectAt(0).text).to.equal('Leave organization');

        // Show buttons that are hidden until hover so Percy can snapshot them:
        find('.user-card-actions').classList.add('opacity-100');
        await percySnapshot(this.test);
      });

      it('renders another Admin user', async function() {
        await render(hbs`<Organizations::UserCard
          @organizationUser={{otherAdminOrganizationUser}}
          @isViewerAdmin={{true}}
        />`);

        expect(UserCard.avatarUrl).to.equal(this.otherAdminOrganizationUser.user.avatarUrl);
        expect(UserCard.userName.isVisible).to.equal(true);
        expect(UserCard.joinDate.isVisible).to.equal(true);
        expect(UserCard.role).to.equal('Administrator');
        expect(UserCard.buttons.length).to.equal(2);
        expect(UserCard.buttons.objectAt(0).text).to.equal('Make member');
        expect(UserCard.buttons.objectAt(1).text).to.equal('Remove');

        // Show buttons that are hidden until hover so Percy can snapshot them:
        find('.user-card-actions').classList.add('opacity-100');
        await percySnapshot(this.test);
      });

      it('renders a Member user', async function() {
        await render(hbs`<Organizations::UserCard
          @organizationUser={{memberOrganizationUser}}
          @isViewerAdmin={{true}}
        />`);

        expect(UserCard.avatarUrl).to.equal(this.memberOrganizationUser.user.avatarUrl);
        expect(UserCard.userName.isVisible).to.equal(true);
        expect(UserCard.joinDate.isVisible).to.equal(true);
        expect(UserCard.role).to.equal('Member');
        expect(UserCard.buttons.length).to.equal(2);
        expect(UserCard.buttons.objectAt(0).text).to.equal('Make admin');
        expect(UserCard.buttons.objectAt(1).text).to.equal('Remove');

        // Show buttons that are hidden until hover so Percy can snapshot them:
        find('.user-card-actions').classList.add('opacity-100');
        await percySnapshot(this.test);
      });

      it('sorts identities correctly: samlp -> github -> auth0', async function() {
        make('identity', 'githubProvider', {user: adminOrganizationUser.user});
        make('identity', 'oktaProvider', {user: adminOrganizationUser.user});
        make('identity', 'auth0Provider', {user: adminOrganizationUser.user});

        await render(
          hbs`<Organizations::UserCard
            @organizationUser={{adminOrganizationUser}}
            @isViewerAdmin={{true}}
          />`,
        );

        expect(UserCard.identityIcons.length).to.equal(3);
        expect(UserCard.identityIcons[0].ariaLabel).to.equal('Okta identity');
        expect(UserCard.identityIcons[1].ariaLabel).to.equal('GitHub identity');
        expect(UserCard.identityIcons[2].ariaLabel).to.equal('Username/Password identity');
        await percySnapshot(this.test);
      });
    });

    describe('as a member user', async function() {
      beforeEach(function() {
        stubSession(this, {currentUser: memberUser});
      });

      it('renders your user', async function() {
        await render(hbs`<Organizations::UserCard @organizationUser={{memberOrganizationUser}} />`);

        expect(UserCard.userName.isVisible).to.equal(true);
        expect(UserCard.joinDate.isVisible).to.equal(true);
        expect(UserCard.role).to.equal('Member');
        expect(UserCard.buttons.length).to.equal(1);
        expect(UserCard.buttons.objectAt(0).text).to.equal('Leave organization');

        // Show buttons that are hidden until hover so Percy can snapshot them:
        find('.user-card-actions').classList.add('opacity-100');
        await percySnapshot(this.test);
      });

      it('renders a Admin user', async function() {
        await render(hbs`<
          Organizations::UserCard
          @organizationUser={{otherAdminOrganizationUser}}
        />`);

        expect(UserCard.userName.isVisible).to.equal(true);
        expect(UserCard.joinDate.isVisible).to.equal(true);
        expect(UserCard.role).to.equal('Administrator');
        expect(UserCard.buttons.length).to.equal(2);
        expect(UserCard.buttons.objectAt(0).text).to.equal('Make member');
        expect(UserCard.buttons.objectAt(1).text).to.equal('Remove');

        // Show buttons that are hidden until hover so Percy can snapshot them:
        find('.user-card-actions').classList.add('opacity-100');
        await percySnapshot(this.test);
      });

      it('renders a Member user', async function() {
        await render(hbs`<
          Organizations::UserCard
          @organizationUser={{otherMemberOrganizationUser}}
        />`);

        expect(UserCard.userName.isVisible).to.equal(true);
        expect(UserCard.joinDate.isVisible).to.equal(true);
        expect(UserCard.role).to.equal('Member');
        expect(UserCard.buttons.length).to.equal(2);
        expect(UserCard.buttons.objectAt(0).text).to.equal('Make admin');
        expect(UserCard.buttons.objectAt(1).text).to.equal('Remove');

        // Show buttons that are hidden until hover so Percy can snapshot them:
        find('.user-card-actions').classList.add('opacity-100');
        await percySnapshot(this.test);
      });
    });
  });

  describe('action buttons', function() {
    let confirmationAlert;
    beforeEach(function() {
      confirmationAlert = sinon.stub(utils, 'confirmMessage').returns(true);
    });
    afterEach(function() {
      confirmationAlert.restore();
    });

    describe('as an admin user', function() {
      beforeEach(function() {
        stubSession(this, {
          currentUser: adminUser,
        });
      });

      describe('Remove', function() {
        it('requests confirmation and calls destroyRecord', async function() {
          await render(
            hbs`<
              Organizations::UserCard
              @organizationUser={{otherAdminOrganizationUser}}
              @isViewerAdmin={{true}}
            />`,
          );
          const orgUserStub = sinon.stub(otherAdminOrganizationUser, 'destroyRecord');

          expect(UserCard.buttons.objectAt(1).text).to.equal('Remove');
          await UserCard.buttons.objectAt(1).click();

          expect(confirmationAlert).to.have.been.called;
          expect(orgUserStub).to.have.been.called;

          orgUserStub.restore;
        });
      });

      describe('Make admin', function() {
        it('calls save on the OrganizationUser', async function() {
          await render(hbs`<
            Organizations::UserCard
            @organizationUser={{memberOrganizationUser}}
            @isViewerAdmin={{true}}
          />`);
          expect(this.memberOrganizationUser.role).to.equal('member');
          const orgUserStub = sinon.stub(memberOrganizationUser, 'save');

          expect(UserCard.buttons.objectAt(0).text).to.equal('Make admin');
          await UserCard.buttons.objectAt(0).click();

          expect(orgUserStub).to.have.been.called;
        });
      });

      describe('Make member', function() {
        it('calls save on the OrganizationUser', async function() {
          await render(
            hbs`<
              Organizations::UserCard
              @organizationUser={{otherAdminOrganizationUser}}
              @isViewerAdmin={{true}}
            />`,
          );

          expect(this.otherAdminOrganizationUser.role).to.equal('admin');
          const orgUserStub = sinon.stub(otherAdminOrganizationUser, 'save');

          expect(UserCard.buttons.objectAt(0).text).to.equal('Make member');
          await UserCard.buttons.objectAt(0).click();

          expect(orgUserStub).to.have.been.called;
        });
      });

      describe('Leave organization', function() {
        let transitionToStub;

        beforeEach(function() {
          transitionToStub = sinon.stub();
          stubService(this, 'router', 'router', {
            transitionTo: transitionToStub,
          });
        });

        it('requests confirmation and calls destroyRecord', async function() {
          await render(
            hbs`<
              Organizations::UserCard
              @organizationUser={{adminOrganizationUser}}
              @isViewerAdmin={{true}}
            />`,
          );
          const orgUserStub = sinon.stub(adminOrganizationUser, 'destroyRecord');

          expect(UserCard.buttons[0].text).to.equal('Leave organization');
          await UserCard.buttons[0].click();

          expect(confirmationAlert).to.have.been.called;
          expect(orgUserStub).to.have.been.called;
          expect(transitionToStub).to.have.been.calledWith('default-org');

          orgUserStub.restore;
        });
      });
    });

    describe('as a member user', function() {
      beforeEach(function() {
        stubSession(this, {currentUser: memberUser});
      });

      describe('Remove', function() {
        it('does nothing', async function() {
          await render(
            hbs`<Organizations::UserCard @organizationUser={{otherMemberOrganizationUser}} />}`,
          );
          const orgUserStub = sinon.stub(otherMemberOrganizationUser, 'destroyRecord');

          expect(UserCard.buttons.objectAt(1).text).to.equal('Remove');
          await UserCard.buttons.objectAt(1).click();

          expect(confirmationAlert).not.to.have.been.called;
          expect(orgUserStub).not.to.have.been.called;

          orgUserStub.restore;
        });
      });

      describe('Make admin', function() {
        it('does nothing', async function() {
          await render(
            hbs`<Organizations::UserCard @organizationUser={{otherMemberOrganizationUser}} />}`,
          );
          expect(this.otherMemberOrganizationUser.role).to.equal('member');
          const orgUserStub = sinon.stub(otherMemberOrganizationUser, 'save');

          expect(UserCard.buttons.objectAt(0).text).to.equal('Make admin');
          await UserCard.buttons.objectAt(0).click();

          expect(orgUserStub).not.to.have.been.called;

          orgUserStub.restore;
        });
      });

      describe('Make member', function() {
        it('does nothing', async function() {
          await render(
            hbs`<Organizations::UserCard @organizationUser={{otherAdminOrganizationUser}} />}`,
          );
          expect(this.otherAdminOrganizationUser.role).to.equal('admin');
          const orgUserStub = sinon.stub(otherAdminOrganizationUser, 'save');

          expect(UserCard.buttons.objectAt(0).text).to.equal('Make member');
          await UserCard.buttons.objectAt(0).click();

          expect(orgUserStub).not.to.have.been.called;

          orgUserStub.restore;
        });
      });
    });
  });
});
