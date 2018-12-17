import {expect} from 'chai';
import {describe, it, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import NewOrganization from 'percy-web/tests/pages/components/new-organization';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import Service from '@ember/service';

describe('Integration: OrganizationsNewOrganization', function() {
  setupRenderingTest('organizations/new-organization', {
    integration: true,
  });

  let user;
  beforeEach(function() {
    setupFactoryGuy(this);
    NewOrganization.setContext(this);
    user = make('user');

    const sessionServiceStub = Service.extend({
      currentUser: user,
    });
    this.owner.register('service:session', sessionServiceStub, 'sessionService');

    this.set('user', user);
    this.set('organizationCreated', () => {});
  });

  describe('when not a github marketplace purchase', function() {
    beforeEach(async function() {
      const newOrganization = make('organization', 'new');
      const githubIdentity = make('identity', 'githubProvider', {user});
      this.setProperties({newOrganization, userIdentities: [githubIdentity]});

      await this.render(hbs`{{organizations/new-organization
        newOrganization=newOrganization
        organizationCreated=organizationCreated
        userIdentities=userIdentities
      }}`);
    });

    it('hides the connect github account section', async function() {
      expect(NewOrganization.hasGithubSection).to.equal(false);
      await percySnapshot(this.test);
    });
  });

  describe('when a github marketplace purchase without github connected', function() {
    beforeEach(async function() {
      const newOrganization = make('organization', 'new', 'fromGithub');
      const auth0Identity = make('identity', 'auth0Provider');
      this.setProperties({newOrganization, userIdentities: [auth0Identity]});
      this.set('newOrganization', newOrganization);

      await this.render(hbs`{{organizations/new-organization
        newOrganization=newOrganization
        organizationCreated=organizationCreated
        userIdentities=userIdentities
      }}`);
    });

    it('shows the connect github account section', async function() {
      expect(NewOrganization.hasGithubSection).to.equal(true);
      await percySnapshot(this.test);
    });

    it('shows the connect to github button', async function() {
      expect(NewOrganization.hasConnectToGithubButton).to.equal(true);
    });

    it('disables the form submission button', async function() {
      expect(NewOrganization.isCreateNewOrganizationDisabled).to.equal(true);
    });

    it('does not focus org input field', async function() {
      expect(NewOrganization.isOrgNameFieldFocused).to.equal(false);
    });
  });

  describe('when a github marketplace purchase with github connected', function() {
    beforeEach(async function() {
      const githubIdentity = make('identity', 'githubProvider', {
        user,
        nickname: 'myGithubAccount',
      });
      const newOrganization = make('organization', 'new', 'fromGithub');
      this.set('newOrganization', newOrganization);
      this.set('userIdentities', [githubIdentity]);

      await this.render(hbs`{{organizations/new-organization
        newOrganization=newOrganization
        organizationCreated=organizationCreated
        userIdentities=userIdentities
      }}`);
    });

    it('shows the connect github account section', async function() {
      expect(NewOrganization.hasGithubSection).to.equal(true);
    });

    it('shows the connected github user', async function() {
      expect(NewOrganization.hasConnectedGithubAccount).to.equal(true);
      expect(NewOrganization.githubAccountName).to.equal('myGithubAccount');
      await percySnapshot(this.test);
    });

    it('focuses org input field', async function() {
      expect(NewOrganization.isOrgNameFieldFocused).to.equal(true);
    });
  });
});
