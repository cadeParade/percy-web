import setupAcceptance, {
  setupSession,
  renderAdapterErrorsAsPage,
} from '../helpers/setup-acceptance';
import {percySnapshot} from 'ember-percy';
import {visit, click, currentRouteName} from '@ember/test-helpers';

describe('Acceptance: Join', function() {
  setupAcceptance();

  setupSession(function(server) {
    server.create('organization', {name: 'Test org'});
    const user = server.create('user', {name: 'Basil Cat'});
    server.create('invite', {
      id: 'valid-code',
      fromUser: user,
    });
    server.create('invite', {
      id: 'expired-code',
      isExpired: true,
      fromUser: user,
    });
  });

  it('expired rejected', async function() {
    await visit('/join/expired-code');
    expect(currentRouteName()).to.equal('join');

    await percySnapshot(this.test);
  });

  it('invalid rejected', async function() {
    await renderAdapterErrorsAsPage(async () => {
      await visit('/join/invalid-code');
      expect(currentRouteName()).to.equal('error');

      await percySnapshot(this.test);
    });
  });

  it('valid accepted', async function() {
    await visit('/join/valid-code');
    expect(currentRouteName()).to.equal('join');

    await percySnapshot(this.test);
    await click('[data-test-accept-invitation]');
    expect(currentRouteName()).to.equal('organizations.organization.projects.new');

    await percySnapshot(this.test.fullTitle() + ' | Into organization');
  });
});
