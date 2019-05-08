import sinon from 'sinon';
import freezeMoment from '../helpers/freeze-moment';
import localStorageProxy from 'percy-web/lib/localstorage';
import {percySnapshot} from 'ember-percy';
import {visit, click, currentRouteName, fillIn, findAll} from '@ember/test-helpers';
import Response from 'ember-cli-mirage/response';
import ProjectPage from 'percy-web/tests/pages/project-page';
import NewOrganization from 'percy-web/tests/pages/components/new-organization';
import setupAcceptance, {
  setupSession,
  renderAdapterErrorsAsPage,
} from '../helpers/setup-acceptance';
import UserMenu from 'percy-web/tests/pages/components/user-menu';

describe('Acceptance: Organization', function() {
  setupAcceptance();
  freezeMoment('2020-01-30');

  let organization;
  describe('user is member', function() {
    setupSession(function(server) {
      organization = server.create('organization', 'withUser');
      server.create('project', {organization});
    });

    it('can create new org via org switcher', async function() {
      await ProjectPage.visitOrg({orgSlug: organization.slug});
      await UserMenu.toggleUserMenu();
      await UserMenu.createNewOrg();
      expect(currentRouteName()).to.equal('organizations.new');
    });

    it('can create new org and update org switcher when creating second org', async function() {
      await ProjectPage.visitOrg({orgSlug: organization.slug});
      await UserMenu.toggleUserMenu();
      await UserMenu.createNewOrg();

      expect(currentRouteName()).to.equal('organizations.new');

      await UserMenu.toggleUserMenu();
      expect(UserMenu.orgLinks.length).to.equal(1);

      await percySnapshot(this.test.fullTitle() + ' | new');
      await NewOrganization.organizationName('New organization');
      await NewOrganization.clickSubmitNewProject();
      expect(currentRouteName()).to.equal('organizations.organization.projects.new');

      await UserMenu.toggleUserMenu();
      expect(UserMenu.orgLinks.length).to.equal(2);

      await percySnapshot(this.test.fullTitle() + ' | setup');
    });

    it('can create new organization and user email when creating first org', async function() {
      // simulate the user having no organizations
      server.db.organizationUsers.remove(1);
      server.db.organizations.remove(1);
      await visit('/organizations/new/');

      await NewOrganization.organizationName('New organization');
      await NewOrganization.fillUserEmail('a@a.com');
      await percySnapshot(this.test.fullTitle());

      await NewOrganization.clickSubmitNewProject();
      expect(currentRouteName()).to.equal('organizations.organization.projects.new');
      expect(findAll('.flash-message.flash-message-success')).to.have.length(1);
    });

    it('does not show email field after first organization is created', async function() {
      // simulate the user having no organizations
      server.db.organizationUsers.remove(1);
      server.db.organizations.remove(1);
      await visit('/organizations/new/');

      await NewOrganization.organizationName('New organization');
      await NewOrganization.fillUserEmail('a@a.com');
      await NewOrganization.clickSubmitNewProject();

      await visit('/organizations/new/');
      expect(NewOrganization.isOrgNameFieldVisible).to.equal(true);
      expect(NewOrganization.isUserEmailFieldVisible).to.equal(false);
    });

    describe('creating a new org with demo project', function() {
      it('shows a custom error screen when there is no project available', async function() {
        server.post('/organizations/:id/projects', {errors: ['Out of demo projects']}, 500);

        await visit('/organizations/new/');
        await NewOrganization.organizationName('New Organization');
        await NewOrganization.clickSubmitNewDemo();
        expect(currentRouteName()).to.equal('organizations.organization.projects.new-demo');
        await percySnapshot(this.test);
      });

      it('polls for a demo project after an initial error', async function() {
        const url = '/organizations/:id/projects';

        let hasVisited = false;
        server.post(url, () => {
          if (!hasVisited) {
            hasVisited = true;
            return new Response(500);
          } else {
            const org = server.schema.organizations.where({
              name: 'New Organization',
            }).models.firstObject;

            server.create('project', 'demo', {
              id: 'foo',
              name: 'My cool demo project ',
              organization: org,
            });

            return server.schema.projects.findBy({id: 'foo'});
          }
        });

        await visit('/organizations/new/');
        await NewOrganization.organizationName('New Organization');
        await NewOrganization.clickSubmitNewDemo();

        expect(currentRouteName()).to.equal('organization.project.index');
      });

      it('redirects to second build when project has at least three builds', async function() {
        // Create some builds to be on the demo project.
        // We can't make these builds ahead of time, because we don't have the new demo-project id
        // until the new demo project request is made.
        server.get('/projects/:organization_slug/:project_slug/builds', function(schema, request) {
          const demoProject = schema.projects
            .all()
            .models.findBy('slug', request.params.project_slug);
          [1, 2, 3].map(i => {
            return schema.builds.create({id: i, buildNumber: i, project: demoProject});
          });
          return schema.builds.where(build => {
            return build.projectId === demoProject.id;
          });
        });
        await visit('/organizations/new/');
        await NewOrganization.organizationName('New organization');
        await NewOrganization.clickSubmitNewDemo();
        expect(currentRouteName()).to.equal('organization.project.builds.build.index');
        await percySnapshot(this.test);
      });

      it('resets demo tooltips when redirecting to the new demo project', async function() {
        // set the tooltip master key before the redirect
        localStorageProxy.set('percy_demo_tooltips_hidden', true);
        // do the redirect
        server.get('/projects/:organization_slug/:project_slug/builds', function(schema, request) {
          const demoProject = schema.projects
            .all()
            .models.findBy('slug', request.params.project_slug);
          [1, 2, 3].map(i => {
            return schema.builds.create({id: i, buildNumber: i, project: demoProject});
          });
          return schema.builds.where(build => {
            return build.projectId === demoProject.id;
          });
        });
        await visit('/organizations/new/');
        await NewOrganization.organizationName('New organization');
        await NewOrganization.clickSubmitNewDemo();
        expect(currentRouteName()).to.equal('organization.project.builds.build.index');

        // test that the master key has been removed from local storage
        expect(localStorageProxy.get('percy_demo_tooltips_hidden')).to.be.undefined;
      });
    });

    it('shows support on users page', async function() {
      window.Intercom = sinon.stub();
      await visit(`/organizations/${organization.slug}/users`);

      await click('[data-test-users-show-support]');
      expect(window.Intercom).to.have.been.called;
    });

    it('shows support on invites page', async function() {
      window.Intercom = sinon.stub();
      await visit(`/organizations/${organization.slug}/users/invite`);

      await click('[data-test-users-show-support]');
      expect(window.Intercom).to.have.been.called;
    });

    describe('usage page', function() {
      async function _canViewUsagePageWithPlan(context, subscriptionTrait) {
        server.create('subscription', subscriptionTrait, {organization});
        await visit(`/organizations/${organization.slug}/usage`);
        expect(currentRouteName()).to.equal('organizations.organization.usage');
        await percySnapshot(context.test);
      }

      it('can view usage page on trial plan', async function() {
        await _canViewUsagePageWithPlan(this, 'withTrialPlan');
      });

      it('can view usage page on free plan', async function() {
        await _canViewUsagePageWithPlan(this, 'withFreePlan');
      });

      it('can view usage page on paid plan', async function() {
        await _canViewUsagePageWithPlan(this, 'withPaidPlan');
      });

      it('can view usage page on legacy plan', async function() {
        await _canViewUsagePageWithPlan(this, 'withCustomPlan');
      });

      it('can view usage page on sponsored plan', async function() {
        await _canViewUsagePageWithPlan(this, 'withSponsoredPlan');
      });
    });
  });

  describe('user is admin', function() {
    setupSession(function(server) {
      organization = server.create('organization', 'withAdminUser');
    });

    it('can edit organization settings', async function() {
      await visit(`/${organization.slug}`);
      expect(currentRouteName()).to.equal('organizations.organization.projects.new');
      await UserMenu.toggleUserMenu();
      await UserMenu.orgLinks.objectAt(0).clickSettings();
      expect(currentRouteName()).to.equal('organizations.organization.settings');

      await percySnapshot(this.test);
      await renderAdapterErrorsAsPage(async () => {
        await fillIn('[data-test-form-input=org-slug]', 'invalid/slug');
        await click('[data-test-edit-org-form] [data-test-org-save-button]');
        return percySnapshot(this.test.fullTitle() + ' | Error when invalid slug');
      });
      await click('.data-test-dashboard-nav-org-users');
      expect(currentRouteName()).to.equal('organizations.organization.users.index');

      await percySnapshot(this.test.fullTitle() + ' | Users settings');
      await click('.data-test-dashboard-nav-org-billing');
      expect(currentRouteName()).to.equal('organizations.organization.billing');

      await percySnapshot(this.test.fullTitle() + ' | Billing settings');
    });
  });
});
