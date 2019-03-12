import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import stubLockModal from 'percy-web/tests/helpers/stub-lock-modal';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';
import ProjectPage from 'percy-web/tests/pages/project-page';
import BuildPage from 'percy-web/tests/pages/build-page';
import NoticeBar from 'percy-web/tests/pages/components/notice-bar';
import {currentRouteName} from '@ember/test-helpers';
import {percySnapshot} from 'ember-percy';

describe('Acceptance: Notice Bar', function() {
  freezeMoment('2018-05-22');
  async function checkNoticeBar(context) {
    expect(NoticeBar.message.isVisible).to.equal(true);
    expect(NoticeBar.billingLink.isVisible).to.equal(true);

    await percySnapshot(context.test);
    await NoticeBar.billingLink.click();
    expect(currentRouteName()).to.equal('organizations.organization.billing');
  }

  async function checkNoticeBarAbsentOnProject(context, organization) {
    const projectWithNoBuilds = server.create('project', {organization});
    await ProjectPage.visitProject({
      orgSlug: organization.slug,
      projectSlug: projectWithNoBuilds.slug,
    });

    expect(currentRouteName()).to.equal('organization.project.index');
    expect(ProjectPage.isNoBuildsPanelVisible).to.equal(true);
    expect(NoticeBar.message.isVisible).to.equal(false);

    await percySnapshot(context.test);
  }

  describe('Free Usage Bar', function() {
    describe('as an authenticated user', function() {
      setupAcceptance();
      let urlParams;
      let organization;

      setupSession(function(server) {
        organization = server.create('organization', 'withUser', 'withFreePlan');
        let project = server.create('project', {organization});
        let build = server.create('build', {project});
        urlParams = {
          orgSlug: organization.slug,
          projectSlug: project.slug,
          buildId: build.id,
        };
      });

      describe('in top header', function() {
        it('appears on project page', async function() {
          await ProjectPage.visitOrg({orgSlug: organization.slug});

          await checkNoticeBar(this);
        });
      });

      describe('in build toolbar', function() {
        it('appears on build page', async function() {
          await BuildPage.visitBuild(urlParams);

          await checkNoticeBar(this);
        });
      });
    });

    describe('as a guest in a public project', function() {
      setupAcceptance({authenticate: false});
      let organization;

      setupSession(function(server) {
        stubLockModal(this.owner);
        this.loginUser = false;
        organization = server.create('organization', 'withFreePlan');
      });

      it('the project loads without the free bar', async function() {
        await checkNoticeBarAbsentOnProject(this, organization);
      });
    });
  });

  describe('Trial Bar', function() {
    describe('as an authenticated user', function() {
      setupAcceptance();
      let urlParams;
      let organization;

      setupSession(function(server) {
        organization = server.create('organization', 'withUser', 'withTrialPlan');
        let project = server.create('project', {organization});
        let build = server.create('build', {project});
        urlParams = {
          orgSlug: organization.slug,
          projectSlug: project.slug,
          buildId: build.id,
        };
      });

      describe('in top header', function() {
        it('appears on project page', async function() {
          await ProjectPage.visitOrg({orgSlug: organization.slug});

          await checkNoticeBar(this);
        });
      });

      describe('in build toolbar', function() {
        it('appears on build page', async function() {
          await BuildPage.visitBuild(urlParams);

          await checkNoticeBar(this);
        });
      });
    });
    describe('as a guest in a public project', function() {
      setupAcceptance({authenticate: false});
      let organization;

      setupSession(function(server) {
        stubLockModal(this.owner);
        this.loginUser = false;
        organization = server.create('organization', 'withTrialPlan');
      });

      it('the project loads without the free bar', async function() {
        await checkNoticeBarAbsentOnProject(this, organization);
      });
    });
  });
});
