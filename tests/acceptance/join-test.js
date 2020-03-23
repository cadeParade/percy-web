import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {visit, click, currentRouteName} from '@ember/test-helpers';
import OrganizationDashboard from 'percy-web/tests/pages/organization-dashboard-page';
import ProjectPage from 'percy-web/tests/pages/project-page';

describe('Acceptance: Join', function () {
  setupAcceptance();

  setupSession(function (server) {
    const organization = server.create('organization', {name: 'Test org'});
    server.create('project', {organization});
    const user = server.create('user', {name: 'Basil Cat'});
    server.create('invite', {
      id: 'valid-code',
      fromUser: user,
      organization,
    });
    server.create('invite', {
      id: 'expired-code',
      isExpired: true,
      fromUser: user,
      organization,
    });
  });

  it('expired rejected', async function () {
    await visit('/join/expired-code');
    expect(currentRouteName()).to.equal('join');

    await percySnapshot(this.test);
  });

  it('invalid rejected', async function () {
    await visit('/join/invalid-code');
    expect(currentRouteName()).to.equal('error');

    await percySnapshot(this.test);
  });

  it('valid accepted', async function () {
    await visit('/join/valid-code');
    expect(currentRouteName()).to.equal('join');

    await percySnapshot(this.test);
    await click('[data-test-percy-btn-label=invite-accept-button]');
    expect(currentRouteName()).to.equal('organization.index');
    expect(OrganizationDashboard.projects.length).to.equal(1);
    await percySnapshot(this.test.fullTitle(), ' | Into organization');

    await OrganizationDashboard.projects[0].clickLink();
    expect(
      ProjectPage.publicBuildNotice.isVisible,
      'public project notice should not be visible',
    ).to.equal(false);
  });
});
