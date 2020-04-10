import freezeMoment from '../helpers/freeze-moment';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {visit, currentRouteName, waitUntil, settled} from '@ember/test-helpers';
import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import sinon from 'sinon';
import OrganizationDashboard from 'percy-web/tests/pages/organization-dashboard-page';
import mockWebsocketService from 'percy-web/tests/helpers/mock-websocket-service';
import {projectsForOrg} from 'percy-web/mirage/config';
import {defer} from 'rsvp';

describe('Acceptance: Organization Dashboard', function () {
  freezeMoment('2020-01-30');

  describe('as a member', function () {
    setupAcceptance();

    let organization;

    setupSession(function (server) {
      organization = server.create('organization', 'withAdminUser');
      server.create('project', {organization});
    });

    it('subscribes to the organization websocket channel', async function () {
      const subscribeToOrganizationStub = sinon.stub();
      mockWebsocketService(this, subscribeToOrganizationStub);

      await visit(`${organization.slug}/`);
      expect(currentRouteName()).to.equal('organization.index');

      expect(subscribeToOrganizationStub).to.have.been.called;
    });
  });

  describe('organization has projects', function () {
    setupAcceptance();

    let organization;

    setupSession(function (server) {
      const repo = server.create('repo');

      organization = server.create('organization', 'withAdminUser', {seatsUsed: 1});

      server.create('project', {
        organization,
        name: 'An enabled project',
      });
      server.create('project', 'isDisabled', {
        organization,
        name: 'A disabled project',
      });
      server.create('project', 'publiclyReadable', {
        organization,
        name: 'A public project',
      });
      server.create('project', 'demo', {
        organization,
        name: 'A demo project',
      });
      // with repo
      server.create('project', {
        organization,
        repo,
        name: 'An org connected to an SCM repo',
      });
    });

    it('lists the projects for the orgnization', async function () {
      await visit(`${organization.slug}/`);
      expect(OrganizationDashboard.projects.length).to.equal(4);
      await percySnapshot(this.test);
    });

    it('shows loading state for projects loading', async function () {
      const deferred = defer();
      const projectQuerySentinel = sinon.stub();
      server.get('/organizations/:slug/projects', async function (schema, request) {
        projectQuerySentinel();
        await deferred.promise;
        return projectsForOrg(schema, request);
      });

      visit(`${organization.slug}/`);
      await waitUntil(() => projectQuerySentinel.called);
      expect(OrganizationDashboard.loadingProjectCards.length).to.equal(3);
      await percySnapshot(this.test);

      await deferred.resolve();
      await settled();
      expect(OrganizationDashboard.projects.length).to.equal(4);
    });

    it('links to the organization settings', async function () {
      await visit(`${organization.slug}/`);
      await OrganizationDashboard.nav.clickOrgSettingsLink();
      expect(currentRouteName()).to.equal('organizations.organization.settings');
      await percySnapshot(this.test);
    });

    it('links to organization billing', async function () {
      await visit(`${organization.slug}/`);
      await OrganizationDashboard.nav.clickBillingLink();
      expect(currentRouteName()).to.equal('organizations.organization.billing');
      await percySnapshot(this.test);
    });

    it('links to organization user management', async function () {
      await visit(`${organization.slug}/`);
      await OrganizationDashboard.nav.clickUsersLink();
      expect(currentRouteName()).to.equal('organizations.organization.users.index');
      await percySnapshot(this.test);
    });

    it('links to organization integration management', async function () {
      await visit(`${organization.slug}/`);
      await OrganizationDashboard.nav.clickIntegrationsLink();
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await percySnapshot(this.test);
    });

    it('links to create new project screen', async function () {
      await visit(`${organization.slug}/`);
      await OrganizationDashboard.nav.clickNewProjectButton();
      expect(currentRouteName()).to.equal('organizations.organization.projects.new');
    });

    it('allows toggle of archived projects', async function () {
      await visit(`${organization.slug}/`);
      await OrganizationDashboard.toggleArchivedProjects();
      expect(OrganizationDashboard.projects.length).to.equal(5);
      await percySnapshot(this.test);
    });
  });

  describe('organization has public project', function () {
    setupAcceptance({authenticate: false});

    let organization;

    setupSession(function (server) {
      this.loginUser = false;

      organization = server.create('organization');
      server.createList('project', 5, {organization});
    });

    it('hides member links when there is no authorized user present', async function () {
      await visit(`${organization.slug}/`);
      expect(currentRouteName()).to.equal('organization.index');
      expect(OrganizationDashboard.nav.isProjectLinkPresent).to.equal(true);

      expect(OrganizationDashboard.nav.isOrgSettingsLinkPresent).to.equal(false);
      expect(OrganizationDashboard.nav.isBillingLinkPresent).to.equal(false);
      expect(OrganizationDashboard.nav.isUsersLinkPresent).to.equal(false);
      expect(OrganizationDashboard.nav.isIntegrationsLinkPresent).to.equal(false);
      expect(OrganizationDashboard.nav.isNewProjectButtonPresent).to.equal(false);

      expect(OrganizationDashboard.isToggleArchivedProjectsVisible).to.equal(false);
    });

    it('does not subscribe to the organization websocket channel', async function () {
      const subscribeToOrganizationStub = sinon.stub();
      mockWebsocketService(this, subscribeToOrganizationStub);

      await visit(`${organization.slug}/`);
      expect(currentRouteName()).to.equal('organization.index');

      expect(subscribeToOrganizationStub).to.not.have.been.called;
    });
  });
});
