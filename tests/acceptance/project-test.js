import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import moment from 'moment';
import ProjectPage from 'percy-web/tests/pages/project-page';
import ProjectSettingsPage from 'percy-web/tests/pages/project-settings-page';
import NewProjectPage from 'percy-web/tests/pages/new-project-page';
import sinon from 'sinon';
import {beforeEach, afterEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {visit, findAll, currentRouteName, settled} from '@ember/test-helpers';
import {selectChoose} from 'ember-power-select/test-support/helpers';
import UserMenu from 'percy-web/tests/pages/components/user-menu';
import FixedTopHeader from 'percy-web/tests/pages/components/fixed-top-header';
import OrganizationDashboard from 'percy-web/tests/pages/organization-dashboard-page';
import IntegrationsIndexPage from 'percy-web/tests/pages/integrations-index-page';
import withVariation from 'percy-web/tests/helpers/with-variation';
describe('Acceptance: Project', function() {
  setupAcceptance();

  describe('organization has no projects', function() {
    setupSession(function(server) {
      this.organization = server.create('organization', 'withUser');
    });

    it('can create', async function() {
      await visit(`/${this.organization.slug}`);
      expect(currentRouteName()).to.equal('organizations.organization.projects.new');
      await percySnapshot(this.test.fullTitle() + ' | new project');
      await NewProjectPage.fillInProjectName('my-new-project');
      await NewProjectPage.clickSubmit();
      expect(currentRouteName()).to.equal('organization.project.index');
    });

    it('shows public notice when org is sponsored', async function() {
      this.organization.update({isSponsored: true});
      await visit(`organizations/${this.organization.slug}/projects/new`);
      await percySnapshot(this.test.fullTitle() + ' | new project');
    });
  });

  describe('organization with admin user has no projects', function() {
    setupSession(function(server) {
      this.organization = server.create('organization', 'withAdminUser');
    });

    it('shows new project page', async function() {
      await visit(`/${this.organization.slug}`);
      expect(currentRouteName()).to.equal('organizations.organization.projects.new');
      await percySnapshot(this.test.fullTitle() + ' | index | admin mode');
    });
  });

  describe('waiting for first build', function() {
    let urlParams;
    setupSession(function(server) {
      let organization = server.create('organization', 'withUser');
      let project = server.create('project', {
        name: 'My Project Name',
        organization,
      });
      server.create('token', {project});
      this.project = project;

      urlParams = {
        orgSlug: organization.slug,
        projectSlug: project.slug,
      };
    });

    it('shows environment variables and demo project instructions', async function() {
      await ProjectPage.visitProject(urlParams);
      expect(currentRouteName()).to.equal('organization.project.index');
      expect(ProjectPage.isGenericDocsButtonVisible).to.equal(true);

      await percySnapshot(this.test);

      await ProjectPage.frameworks.objectAt(0).click();

      expect(ProjectPage.isExampleProjectButtonVisible).to.equal(true);
      expect(ProjectPage.isFrameworkDocsButtonVisible).to.equal(true);
      await percySnapshot(this.test.fullTitle() + ' | framework links are visible');

      await ProjectPage.frameworkCategories[1].click();
      await ProjectPage.lastFramework.click();

      expect(ProjectPage.isSdkRequestFieldVisible).to.equal(true);
      await percySnapshot(this.test.fullTitle() + ' | request SDK field is visible');
    });

    it('polls for updates and updates the list when a build is created', async function() {
      const url = `projects/${urlParams.orgSlug}/${urlParams.projectSlug}/builds`;
      server.create('build', 'withSnapshots', {id: 'foo', project: this.project});

      let hasVisitedBuildPage = false;
      server.get(url, () => {
        if (!hasVisitedBuildPage) {
          hasVisitedBuildPage = true;
          return {data: []};
        } else {
          return server.schema.builds.where({id: 'foo'});
        }
      });

      await ProjectPage.visitProject(urlParams);

      expect(ProjectPage.builds.length).to.equal(1);
    });
  });

  describe('with a public project', function() {
    freezeMoment('2018-05-22');

    let urlParams;

    setupSession(function(server) {
      const organization = server.create('organization', 'withUser');
      const demoProject = server.create('project', 'publiclyReadable', {organization});
      urlParams = {
        orgSlug: organization.slug,
        projectSlug: demoProject.slug,
      };
    });

    it('shows the public globe icon in the header', async function() {
      await ProjectPage.visitProject(urlParams);
      expect(ProjectPage.isPublicProjectIconVisible).to.equal(true);
    });
  });

  describe('settings and integrations', function() {
    let organization;
    let enabledProject;
    let versionControlIntegration;
    let repos;
    let webhookConfig;

    beforeEach(function() {
      organization = server.create('organization', 'withUser');
      versionControlIntegration = server.create('versionControlIntegration', 'github');
      repos = server.createList('repo', 3);
      webhookConfig = server.create('webhookConfig');
      enabledProject = server.create('project', 'withChromeAndFirefox', {
        name: 'Enabled Project',
        organization,
      });
    });

    describe('with the only-admins-edit-settings feature flag on', function() {
      beforeEach(function() {
        withVariation(this.owner, 'only-admins-edit-settings', true);
      });

      afterEach(function() {
        withVariation(this.owner, 'only-admins-edit-settings', false);
      });

      describe('user is member', function() {
        setupSession(() => {});

        it('hides settings', async function() {
          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: enabledProject.slug,
          });
          await percySnapshot(this.test);

          expect(ProjectSettingsPage.projectEditForm.isVisible).to.equal(false);
          expect(ProjectSettingsPage.browserSelector.isVisible).to.equal(false);
        });

        it('hides integrations', async function() {
          await ProjectSettingsPage.visitProjectIntegrations({
            orgSlug: organization.slug,
            projectSlug: enabledProject.slug,
          });
          await percySnapshot(this.test);

          expect(ProjectSettingsPage.webhookConfigList.isVisible).to.equal(false);
          expect(ProjectSettingsPage.slackInfo.isVisible).to.equal(false);
        });
      });

      describe('user is admin', function() {
        let adminUser;

        beforeEach(function() {
          adminUser = server.create('user');
          server.create('organizationUser', {user: adminUser, organization, role: 'admin'});
        });

        setupSession(function() {
          this.loginUser = adminUser;
        });

        it('shows settings', async function() {
          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: enabledProject.slug,
          });
          await percySnapshot(this.test);

          expect(ProjectSettingsPage.projectEditForm.isVisible).to.equal(true);
          expect(ProjectSettingsPage.browserSelector.isVisible).to.equal(true);
        });

        it('shows integrations', async function() {
          await ProjectSettingsPage.visitProjectIntegrations({
            orgSlug: organization.slug,
            projectSlug: enabledProject.slug,
          });
          await percySnapshot(this.test);

          expect(ProjectSettingsPage.webhookConfigList.isVisible).to.equal(true);
          expect(ProjectSettingsPage.slackInfo.isVisible).to.equal(true);
        });
      });
    });

    describe('settings', function() {
      setupSession(() => {});

      it('displays Branch settings section', async function() {
        await ProjectSettingsPage.visitProjectSettings({
          orgSlug: organization.slug,
          projectSlug: enabledProject.slug,
        });
        await percySnapshot(this.test);

        expect(ProjectSettingsPage.isBranchSettingsVisible).to.equal(true);
      });

      it('navigates to SCM integration setups', async function() {
        async function visitProjectIntegrations() {
          return await ProjectSettingsPage.visitProjectIntegrations({
            orgSlug: organization.slug,
            projectSlug: enabledProject.slug,
          });
        }

        await visitProjectIntegrations();
        await ProjectSettingsPage.repoIntegrator.clickGithub();
        expect(currentRouteName()).to.equal('organizations.organization.integrations.github');

        await visitProjectIntegrations();
        await ProjectSettingsPage.repoIntegrator.clickGitlab();
        expect(currentRouteName()).to.equal('organizations.organization.integrations.gitlab');

        await visitProjectIntegrations();
        await ProjectSettingsPage.repoIntegrator.clickBitbucket();
        expect(currentRouteName()).to.equal(
          'organizations.organization.integrations.bitbucket-cloud',
        );
      });

      describe('browser toggling', function() {
        let deleteStub;
        let createStub;
        let projectWithBothBrowsers;
        let projectWithFirefoxOnly;

        const createData = {
          data: {
            relationships: {
              'browser-family': {data: {type: 'browser-families', id: '2'}},
              project: {data: {type: 'projects', id: '2'}},
            },
            type: 'project-browser-targets',
          },
        };

        beforeEach(function() {
          deleteStub = sinon.stub();
          createStub = sinon.stub();
          projectWithBothBrowsers = enabledProject;
          projectWithFirefoxOnly = server.create('project', 'withFirefox', {organization});

          server.del('/project-browser-targets/:id', (schema, request) => {
            deleteStub(request.url);
          });

          server.post('/project-browser-targets', () => {
            createStub(createData);
            // This response object is not used for testing,
            // it is only used to make mirage think it has recieved a valid response.
            return server.create('projectBrowserTarget', {
              project: projectWithFirefoxOnly,
              browserTarget: server.create('browserTarget', 'withChromeBrowserFamily'),
            });
          });
        });

        it('calls correct endpoint when removing a browser', async function() {
          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: projectWithBothBrowsers.slug,
          });

          await ProjectSettingsPage.browserSelector.chromeButton.click();
          await percySnapshot(this.test);

          expect(deleteStub).to.have.been.calledWith('/api/v1/project-browser-targets/2');
          const flashMessages = findAll('.flash-message.flash-message-success');
          expect(flashMessages).to.have.length(1);
        });

        it('calls correct endpoint when adding a browser', async function() {
          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: projectWithFirefoxOnly.slug,
          });

          await ProjectSettingsPage.browserSelector.chromeButton.click();
          await percySnapshot(this.test);

          expect(createStub).to.have.been.calledWith(createData);
          const flashMessages = findAll('.flash-message.flash-message-success');
          expect(flashMessages).to.have.length(1);
        });

        it('calls correct endpoints when upgrading a browser', async function() {
          const firefoxFamily = server.schema.browserFamilies.findBy({slug: 'firefox'});
          projectWithBothBrowsers.projectBrowserTargets.models.forEach(pbt => {
            if (pbt.browserTarget.browserFamilyId === firefoxFamily.id) {
              pbt.update({isUpgradeable: true});
            }
          });
          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: projectWithBothBrowsers.slug,
          });

          await percySnapshot(this.test);
          await ProjectSettingsPage.browserSelector.upgradeFirefox();
          await settled();

          expect(createStub).to.have.been.calledWith(createData);
          expect(deleteStub).to.have.been.calledWith('/api/v1/project-browser-targets/1');
        });

        it('does not allow removing the last browser', async function() {
          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: projectWithFirefoxOnly.slug,
          });

          await ProjectSettingsPage.browserSelector.firefoxButton.click();

          expect(deleteStub).to.not.have.been.called;
        });
      });

      describe('updating project settings', function() {
        it('sends correct data', async function() {
          const stub = sinon.stub();
          server.patch('/projects/:full_slug', function(schema, request) {
            const fullSlug = decodeURIComponent(request.params.full_slug);
            const attrs = this.normalizedRequestAttrs('project');
            const project = schema.projects.findBy({fullSlug: fullSlug});
            project.update(
              Object.assign(attrs, {
                fullSlug: 'my_organization_that_i_love_and_cherish_0/new-slug',
              }),
            );
            stub(attrs);
            server.create('project', attrs);
            return project;
          });

          await ProjectSettingsPage.visitProjectSettings({
            orgSlug: organization.slug,
            projectSlug: enabledProject.slug,
          });

          await ProjectSettingsPage.projectEditForm.togglePublicCheckbox();
          await ProjectSettingsPage.projectEditForm.fillInProjectName('new-name');
          await ProjectSettingsPage.projectEditForm.fillInProjectSlug('new-slug');
          await ProjectSettingsPage.projectEditForm.clickSave();

          expect(stub).to.have.been.called;
          expect(stub.args[0][0]).to.include({
            name: 'new-name',
            slug: 'new-slug',
            publiclyReadable: true,
          });

          expect(currentRouteName()).to.equal('organization.project.settings.index');
        });
      });
    });

    describe('integrations', function() {
      setupSession(() => {});

      it('displays github integration select menu', async function() {
        organization.update({versionControlIntegrations: [versionControlIntegration], repos});

        await ProjectSettingsPage.visitProjectIntegrations({
          orgSlug: organization.slug,
          projectSlug: enabledProject.slug,
        });
        expect(ProjectSettingsPage.repoIntegrator.isRepoSelectorVisible).to.equal(true);
        await percySnapshot(this.test);
      });

      it('displays webhook configs', async function() {
        enabledProject.update({webhookConfigs: [webhookConfig]});

        await ProjectSettingsPage.visitProjectIntegrations({
          orgSlug: organization.slug,
          projectSlug: enabledProject.slug,
        });

        await percySnapshot(this.test);

        expect(ProjectSettingsPage.webhookConfigList.webhookConfigs.objectAt(0).url).to.equal(
          webhookConfig.url,
        );
      });

      it('transitions to webhook config form', async function() {
        var fake = sinon.fake.returns(new Uint8Array(32));
        sinon.replace(window.crypto, 'getRandomValues', fake);

        await ProjectSettingsPage.visitProjectIntegrations({
          orgSlug: organization.slug,
          projectSlug: enabledProject.slug,
        });

        await ProjectSettingsPage.webhookConfigList.newWebhookConfig();

        await percySnapshot(this.test);

        expect(currentRouteName()).to.equal(
          'organization.project.integrations.webhooks.webhook-config',
        );
        sinon.restore();
      });

      it('displays the Slack section', async function() {
        await ProjectSettingsPage.visitProjectIntegrations({
          orgSlug: organization.slug,
          projectSlug: enabledProject.slug,
        });
        expect(ProjectSettingsPage.slackInfo.isVisible).to.equal(true);
        await percySnapshot(this.test);

        await ProjectSettingsPage.slackIntegrationsLink.click();
        expect(IntegrationsIndexPage.isVisible).to.equal(true);
        await percySnapshot(`${this.test.fullTitle()} - #2`);
      });
    });
  });

  describe('builds', function() {
    freezeMoment('2018-05-22');

    let urlParams;
    let project;
    let organization;

    beforeEach(function() {
      const repo = server.create('repo');
      organization = server.create('organization', 'withUser');
      project = server.create('project', {
        name: 'project with builds',
        organization,
        repo,
      });
      server.create('project', {
        name: 'project without builds',
        organization,
      });

      urlParams = {
        orgSlug: organization.slug,
        projectSlug: project.slug,
      };

      function _timeAgo(quantity, timeUnit) {
        return moment().subtract(quantity, timeUnit);
      }

      server.create('build', 'withSnapshots', {
        project,
        createdAt: _timeAgo(60, 'days'),
        buildNumber: 1,
        totalOpenComments: 4,
      });
      server.create('build', 'expired', {
        project,
        createdAt: _timeAgo(30, 'hours'),
        buildNumber: 2,
      });
      server.create('build', 'failed', {
        project,
        createdAt: _timeAgo(3, 'hours'),
        buildNumber: 3,
      });
      server.create('build', 'failedWithTimeout', {
        project,
        createdAt: _timeAgo(25, 'minutes'),
        buildNumber: 4,
      });
      server.create('build', 'failedWithNoSnapshots', {
        project,
        createdAt: _timeAgo(25, 'minutes'),
        buildNumber: 5,
      });
      server.create('build', 'failedWithMissingResources', {
        project,
        createdAt: _timeAgo(15, 'minutes'),
        buildNumber: 6,
      });
      server.create('build', 'pending', {
        project,
        createdAt: _timeAgo(10, 'minutes'),
        buildNumber: 7,
      });
      server.create('build', 'approved', {
        project,
        createdAt: _timeAgo(5, 'minutes'),
        buildNumber: 8,
        branch: 'branch-mc-branch-face',
      });
      server.create('build', 'approvedPreviously', {
        project,
        createdAt: _timeAgo(4, 'minutes'),
        buildNumber: 9,
        totalOpenComments: 10,
      });
      server.create('build', 'approvedWithNoDiffs', {
        project,
        createdAt: _timeAgo(2, 'minutes'),
        buildNumber: 10,
        branch: 'branch-mc-branch-face',
      });
      server.create('build', 'approvedAutoBranch', {
        project,
        createdAt: _timeAgo(3, 'minutes'),
        buildNumber: 11,
      });
      server.create('build', 'processing', {
        project,
        createdAt: _timeAgo(10, 'seconds'),
        buildNumber: 12,
      });
      server.create('build', 'withSnapshots', 'rejected', {
        totalSnapshotsUnreviewed: 3,
        totalSnapshotsRequestingChanges: 2,
        totalSnapshots: 10,
        project,
        createdAt: _timeAgo(5, 'seconds'),
        buildNumber: 13,
      });
      server.create('build', 'failedWithMissingFinalize', {
        project,
        createdAt: _timeAgo(3, 'seconds'),
        buildNumber: 14,
      });
      this.project = project;
    });

    setupSession(() => {});

    it('shows builds on index', async function() {
      await ProjectPage.visitProject(urlParams);
      await percySnapshot(this.test);
      expect(currentRouteName()).to.equal('organization.project.index');
    });

    it('hides the loader when there are less than 50 builds', async function() {
      await ProjectPage.visitProject(urlParams);

      expect(ProjectPage.infinityLoader.isPresent).to.equal(false);
      expect(ProjectPage.builds.length).to.equal(14);
    });

    it('shows builds with identical build numbers', async function() {
      server.create('build', 'approvedPreviously', {
        project,
        createdAt: moment().subtract(3, 'minutes'),
        buildNumber: 9,
      });

      await ProjectPage.visitProject(urlParams);
      expect(ProjectPage.builds.length).to.equal(15);
    });

    it('shows the loader when there are more than 50 builds', async function() {
      // 50 comes from INFINITY_SCROLL_LIMIT in the build model
      server.createList('build', 50, {project: this.project});

      await ProjectPage.visitProject(urlParams);

      // expect infinity loader to be present
      expect(ProjectPage.infinityLoader.isPresent).to.equal(true);
    });

    it('navigates to build page after clicking build', async function() {
      await ProjectPage.visitProject(urlParams);
      expect(currentRouteName()).to.equal('organization.project.index');
      await ProjectPage.finishedBuilds.objectAt(5).click();
      expect(currentRouteName()).to.equal('organization.project.builds.build.index');
      await percySnapshot(this.test.fullTitle());
    });

    it('resets branch filter when navigating to another project', async function() {
      const repo = server.create('repo');

      const project2 = server.create('project', {organization, repo: repo});
      server.createList('build', 3, {project: project2});

      await ProjectPage.visitProject(urlParams);
      await selectChoose('', 'branch-mc-branch-face');

      await FixedTopHeader.clickOrgDashboardLink();
      await OrganizationDashboard.projects.objectAt(2).clickLink();

      expect(ProjectPage.builds.length).to.equal(3);
    });

    // eslint-disable-next-line
    it('resets builds when navigating to another project in another org with the same slug', async function() {
      const otherOrgName = 'doppleganger org';
      const otherOrganization = server.create('organization', {name: otherOrgName});
      server.create('organizationUser', {
        organization: otherOrganization,
        user: server.schema.users.first(),
      });
      server.create('project', {
        name: 'project with builds',
        organization: otherOrganization,
      });

      await ProjectPage.visitProject(urlParams);
      await UserMenu.toggleUserMenu();
      await UserMenu.orgLinks.objectAt(1).clickLink();

      expect(ProjectPage.builds.length).to.equal(0);
    });

    // eslint-disable-next-line
    it('resets builds when navigating to another project in same org with no scm integration', async function() {
      const project1 = server.create('project', {organization});
      server.createList('build', 3, {project: project1});
      const project2 = server.create('project', {organization});
      server.createList('build', 2, {project: project2});

      await ProjectPage.visitProject({orgSlug: organization.slug, projectSlug: project1.slug});
      expect(ProjectPage.builds.length).to.equal(3);

      await FixedTopHeader.clickOrgDashboardLink();
      await OrganizationDashboard.projects.objectAt(3).clickLink();

      expect(ProjectPage.builds.length).to.equal(2);
    });
  });

  describe('demo project', function() {
    let urlParams;

    beforeEach(function() {
      const organization = server.create('organization', 'withUser');
      const demoProject = server.create('project', 'demo', 'withChromeAndFirefox', {organization});
      urlParams = {
        orgSlug: organization.slug,
        projectSlug: demoProject.slug,
      };
    });

    setupSession(() => {});

    describe('project settings page', function() {
      beforeEach(async function() {
        await ProjectSettingsPage.visitProjectSettings(urlParams);
      });

      it('everything is disabled', async function() {
        const editForm = ProjectSettingsPage.projectEditForm;

        expect(ProjectSettingsPage.envVarText).to.equal(
          'PERCY_TOKEN=[This is a demo project. Create your own project to get a PERCY_TOKEN]',
        );

        await ProjectSettingsPage.browserSelector.buttonContainers.forEach(async button => {
          expect(button.isDisabled, 'browser button should be disabled').to.equal(true);
          expect(button.isActive, 'browser button should be active').to.equal(true);
          await button.click();
          expect(button.isActive, 'button should be active after click').to.equal(true);
        });

        expect(editForm.isNameDisabled).to.equal(true);
        expect(editForm.isSlugDisabled).to.equal(true);
        expect(editForm.isAutoApproveInputDisabled).to.equal(true);
        expect(editForm.isPublicCheckboxDisabled).to.equal(true);
        await editForm.togglePublicCheckbox();
        expect(editForm.isPublicCheckboxChecked).to.equal(false);
        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('project integrations page', function() {
      beforeEach(async function() {
        await ProjectSettingsPage.visitProjectIntegrations(urlParams);
      });

      it('everything is disabled', async function() {
        expect(
          ProjectSettingsPage.repoIntegrator.demoNotice.text.includes('Set up your own project'),
        ).to.equal(true);

        expect(ProjectSettingsPage.webhookConfigList.isNewWebhookConfigButtonDisabled).to.equal(
          true,
        );
        await ProjectSettingsPage.webhookConfigList.newWebhookConfig();
        expect(currentRouteName()).to.equal('organization.project.integrations.index');

        await percySnapshot(`${this.test.fullTitle()} project integration page`);

        await ProjectSettingsPage.repoIntegrator.clickDemoLink();
        expect(currentRouteName()).to.equal('organizations.organization.projects.new');
        await percySnapshot(`${this.test.fullTitle()} new project page`);
      });
    });
  });
});
