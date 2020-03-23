import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import stubLockModal from 'percy-web/tests/helpers/stub-lock-modal';
import localStorageProxy from 'percy-web/lib/localstorage';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';
import {visit, currentRouteName, currentURL} from '@ember/test-helpers';

describe('Acceptance: Recent Project', function () {
  describe('when user is not logged in', function () {
    setupAcceptance({authenticate: false});

    setupSession(function () {
      stubLockModal(this.owner);
      this.loginUser = false;
    });

    it('redirects to login', async function () {
      await visit('/recent-project');
      expect(currentRouteName()).to.equal('login');
    });
  });

  describe('when user is logged in', function () {
    setupAcceptance();
    SetupLocalStorageSandbox();

    describe('when user has organizations without projects', function () {
      let organization;
      let otherOrganization;

      setupSession(function (server) {
        const user = server.create('user');
        organization = server.create('organization');
        otherOrganization = server.create('organization');
        server.create('organizationUser', {organization, user});
        server.create('organizationUser', {organization: otherOrganization, user});
      });

      it("redirects to user's most recent org", async function () {
        localStorageProxy.set('lastOrganizationSlug', otherOrganization.slug);
        await visit('/recent-project');
        expect(currentRouteName()).to.equal('organizations.organization.projects.new');
        expect(currentURL()).to.include(otherOrganization.slug);
      });
    });

    describe('when a user has organizations with projects', function () {
      let organization;
      let otherOrganization;
      let project;

      setupSession(function (server) {
        const user = server.create('user');
        organization = server.create('organization');
        otherOrganization = server.create('organization');
        project = server.create('project', {organization});

        server.create('organizationUser', {organization, user});
        server.create('organizationUser', {organization: otherOrganization, user});
      });

      it('redirects to the org and project in localstorage', async function () {
        let recentProjectSlugs = {};
        recentProjectSlugs[organization.slug] = project.slug;

        localStorageProxy.set('lastOrganizationSlug', organization.slug);
        localStorageProxy.set('recentProjectSlugs', recentProjectSlugs);

        await visit('/recent-project');
        expect(currentRouteName()).to.equal('organization.project.index');
      });
    });

    describe('when user does not have organizations', function () {
      setupSession(function (server) {
        server.create('user');
      });

      it('redirects to organizations.new', async function () {
        await visit('/recent-project');
        expect(currentRouteName()).to.equal('organizations.new');
      });
    });
  });
});
