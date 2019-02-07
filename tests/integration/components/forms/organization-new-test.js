import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import NewOrganization from 'percy-web/tests/pages/components/new-organization';
import sinon from 'sinon';
import {percySnapshot} from 'ember-percy';
import Service from '@ember/service';
import {defer} from 'rsvp';

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
    const identities = [];

    this.setProperties({
      isFirstOrganization: false,
      newOrganization,
      identities,
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
        userIdentities=identities
        save=(action "save")
      }}`);
    });

    it('displays correct fields', async function() {
      expect(NewOrganization.isOrgNameFieldVisible).to.equal(true);
      expect(NewOrganization.isUserEmailFieldVisible).to.equal(false);
    });

    it('disables submit buttons on load', async function() {
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
      expect(NewOrganization.isCreateNewDemoDisabled).to.equal(true);
    });

    it('does not enable submit buttons when invalid org name is entered', async function() {
      await NewOrganization.organizationName('');
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
      expect(NewOrganization.isCreateNewDemoDisabled).to.equal(true);
      percySnapshot(this.test);
    });

    it('enables submit buttons when a valid org name is entered', async function() {
      await NewOrganization.organizationName('my-cool-organization');
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(false);
      expect(NewOrganization.isCreateNewDemoDisabled).to.equal(false);
    });

    // TODO: why does it not like `calledWith`?
    it('saves organization successfully when submit project button is clicked', async function() {
      await NewOrganization.organizationName('my-cool-organization').clickSubmitNewProject();
      expect(saveStub).to.have.been.called;
    });

    it('saves organization successfully when demo submit button is clicked', async function() {
      await NewOrganization.organizationName('my-cool-organization').clickSubmitNewDemo();
      expect(saveStub).to.have.been.called;
    });

    it('disables demo button when project button is saving', async function() {
      const deferred = defer();
      saveStub.returns(deferred.promise);
      await NewOrganization.organizationName('my-cool-organization').clickSubmitNewProject();
      expect(NewOrganization.isCreateProjectSaving).to.equal(true);
      expect(NewOrganization.isCreateNewDemoDisabled).to.equal(true);
    });

    it('disables project button when demo button is saving', async function() {
      const deferred = defer();
      saveStub.returns(deferred.promise);
      await NewOrganization.organizationName('my-cool-organization').clickSubmitNewDemo();
      expect(NewOrganization.isCreateDemoSaving).to.equal(true);
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
    });
  });

  describe('when isFirstOrganization is true', function() {
    beforeEach(async function() {
      this.set('isFirstOrganization', true);
    });

    describe('when a user has an email/password identity', function() {
      beforeEach(async function() {
        const emailPasswordIdentity = make('identity', 'auth0Provider');
        const identities = [emailPasswordIdentity];
        this.setProperties({identities});

        await this.render(hbs`{{forms/organization-new
          model=newOrganization
          isFirstOrganization=isFirstOrganization
          userIdentities=identities
          save=(action "save")
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
        const identities = [githubIdentity];

        const sessionServiceStub = Service.extend({currentUser});
        this.owner.register('service:session', sessionServiceStub, 'sessionService');

        this.setProperties({currentUser, identities});

        await this.render(hbs`{{forms/organization-new
          model=newOrganization
          isFirstOrganization=isFirstOrganization
          userIdentities=identities
          save=(action "save")
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
        expect(NewOrganization.isCreateNewDemoDisabled).to.equal(true);
      });

      it('does not enable submit button when invalid email is entered', async function() {
        await NewOrganization.fillUserEmail('You are the best');
        await NewOrganization.organizationName('my-cool-organization');
        expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
        expect(NewOrganization.isCreateNewDemoDisabled).to.equal(true);
      });

      it('enables submit button when a valid org name and user email is entered', async function() {
        await NewOrganization.organizationName('my-cool-organization');
        await NewOrganization.fillUserEmail('Youarethebest@thebest.com');
        expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(false);
        expect(NewOrganization.isCreateNewDemoDisabled).to.equal(false);
      });

      it('saves org and user successfully when submit button is clicked', async function() {
        const newEmail = 'Youarethebest@thebest.com';
        const flashMessageService = this.owner
          .lookup('service:flash-messages')
          .registerTypes(['success']);
        sinon.stub(flashMessageService, 'success');

        await NewOrganization.organizationName('my-cool-organization')
          .fillUserEmail(newEmail)
          .clickSubmitNewProject();

        expect(saveStub).to.have.been.called;
        expect(userSaveStub).to.have.been.called;
        expect(flashMessageService.success).to.have.been.calledWith(
          `Check ${newEmail} to verify it!`,
        );
      });
    });
  });
});
