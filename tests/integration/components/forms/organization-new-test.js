import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import NewOrganization from 'percy-web/tests/pages/components/new-organization';
import sinon from 'sinon';

describe('Integration: OrganizationNewForm', function() {
  setupRenderingTest('forms/organization-new', {
    integration: true,
  });

  let newOrganization;
  let saveStub;
  beforeEach(async function() {
    setupFactoryGuy(this);
    NewOrganization.setContext(this);

    newOrganization = make('organization', 'new');
    saveStub = sinon.stub();
    newOrganization.save = saveStub;

    this.setProperties({
      isFirstOrganization: false,
      newOrganization,
      actions: {
        save: saveStub,
      },
    });
  });

  describe('when isFirstOrganization is false', function() {
    beforeEach(async function() {
      await this.render(hbs`{{forms/organization-new
        model=newOrganization
        isFirstOrganization=isFirstOrganization
        save=(action "save")
      }}`);
    });

    it('displays correct fields', async function() {
      expect(NewOrganization.isOrgNameFieldVisible).to.equal(true);
      expect(NewOrganization.isUserEmailFieldVisible).to.equal(false);
    });

    it('disables submit button on load', async function() {
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
    });

    it('does not enable submit button when invalid org name is entered', async function() {
      await NewOrganization.organizationName('');
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
    });

    it('enables submit button when a valid org name is entered', async function() {
      await NewOrganization.organizationName('my-cool-organization');
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(false);
    });

    it('saves organization successfully when submit button is clicked', async function() {
      await NewOrganization.organizationName('my-cool-organization').clickSubmit();
      expect(saveStub).to.have.been.called;
    });
  });

  describe('when isFirstOrganization is true', function() {
    beforeEach(async function() {
      this.set('isFirstOrganization', true);
    });

    // this set of tests passes currentUser as a parameter even though it is not passed
    // in the actual component. This is because the async relationship between identities and user
    // is very difficult to mock correctly in tests, so I've shortcutted the fetch by passing
    // currentUser directly.
    describe('when a user has an email/password identity', function() {
      beforeEach(async function() {
        const currentUser = make('user');
        const emailPasswordIdentity = make('identity', 'auth0Provider', {user: currentUser});
        currentUser.set('emailPasswordIdentity', emailPasswordIdentity);
        this.set('currentUser', currentUser);

        await this.render(hbs`{{forms/organization-new
          model=newOrganization
          isFirstOrganization=isFirstOrganization
          save=(action "save")
          currentUser=currentUser
        }}`);
      });

      it('displays only company name field when user has emailPassword identity', async function() {
        expect(NewOrganization.isOrgNameFieldVisible).to.equal(true);
        expect(NewOrganization.isUserEmailFieldVisible).to.equal(false);
      });
    });

    describe('when a user has only a github identity', function() {
      let userSaveStub;
      beforeEach(async function() {
        userSaveStub = sinon.stub();
        const currentUser = make('user');
        currentUser.save = userSaveStub;
        const githubIdentity = make('identity', 'githubProvider', {user: currentUser});
        currentUser.set('githubIdentity', githubIdentity);
        this.set('currentUser', currentUser);

        await this.render(hbs`{{forms/organization-new
          model=newOrganization
          isFirstOrganization=isFirstOrganization
          save=(action "save")
          currentUser=currentUser
        }}`);
      });

      it('displays correct fields', async function() {
        expect(NewOrganization.isOrgNameFieldVisible).to.equal(true);
        expect(NewOrganization.isUserEmailFieldVisible).to.equal(true);
        expect(NewOrganization.userEmailValue).to.equal('');
      });

      it('disables submit button on load', async function() {
        expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
      });

      it('does not enable submit button when invalid org name is entered', async function() {
        await NewOrganization.organizationName('');
        await NewOrganization.fillUserEmail('Youarethebest@thebest.com');
        expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
      });

      it('does not enable submit button when invalid email is entered', async function() {
        await NewOrganization.fillUserEmail('You are the best');
        await NewOrganization.organizationName('my-cool-organization');
        expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
      });

      it('enables submit button when a valid org name and user email is entered', async function() {
        await NewOrganization.organizationName('my-cool-organization');
        await NewOrganization.fillUserEmail('Youarethebest@thebest.com');
        expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(false);
      });

      it('saves org and user successfully when submit button is clicked', async function() {
        const newEmail = 'Youarethebest@thebest.com';
        const flashMessageService = this.owner
          .lookup('service:flash-messages')
          .registerTypes(['success']);
        sinon.stub(flashMessageService, 'success');

        await NewOrganization.organizationName('my-cool-organization')
          .fillUserEmail(newEmail)
          .clickSubmit();

        expect(saveStub).to.have.been.called;
        expect(userSaveStub).to.have.been.called;
        expect(flashMessageService.success).to.have.been.calledWith(
          `Check ${newEmail} to verify it!`,
        );
      });

      it('saves org and user successfully when submit button is clicked', async function() {
        const newEmail = 'Youarethebest@thebest.com';
        const flashMessageService = this.owner
          .lookup('service:flash-messages')
          .registerTypes(['success']);
        sinon.stub(flashMessageService, 'success');

        await NewOrganization.organizationName('my-cool-organization')
          .fillUserEmail(newEmail)
          .clickSubmit();

        expect(saveStub).to.have.been.called;
        expect(userSaveStub).to.have.been.called;
        expect(flashMessageService.success).to.have.been.calledWith(
          `Check ${newEmail} to verify it!`,
        );
      });
    });
  });
});
