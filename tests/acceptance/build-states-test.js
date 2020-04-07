import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import {currentRouteName} from '@ember/test-helpers';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import moment from 'moment';
import sinon from 'sinon';
import BuildPage from 'percy-web/tests/pages/build-page';
import mockPusher from 'percy-web/tests/helpers/mock-pusher';

describe('Acceptance: Auto-approved Branch Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'auto-approved-branch build', organization});
    let build = server.create('build', 'approvedAutoBranch', {project});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as auto-approved', async function () {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
  });
});

describe('Acceptance: Pending Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'pending build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'pending',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as pending', async function () {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open', {
      darkMode: true,
    });
  });
});

describe('Acceptance: Processing Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'project-with-processing-build', organization});
    let build = server.create('build', 'processing', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as processing', async function () {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open', {
      darkMode: true,
    });
  });
});

describe('Acceptance: Failed Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'project-with-failed-build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'failed',
      failureReason: 'render_timeout',
      failureDetails: {failed_snapshots: ['Home page that pops open a dialog']},
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as failed', async function () {
    await BuildPage.visitBuild(urlParams);
    window.Intercom = sinon.stub();
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open', {
      darkMode: true,
    });
    await BuildPage.clickShowSupportLink();
    expect(window.Intercom).to.have.been.calledWith('show');
  });
});
