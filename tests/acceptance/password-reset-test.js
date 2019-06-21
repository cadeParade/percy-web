import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {visit} from '@ember/test-helpers';
import {percySnapshot} from 'ember-percy';

describe('Acceptance: PasswordReset', function() {
  setupAcceptance({authenticate: false});

  setupSession(function(server) {
    this.loginUser = false;
    this.server = server;
  });

  it('shows page with password reset message', async function() {
    await visit('/auth/password-reset');
    await percySnapshot(this.test.fullTitle());
  });
});
