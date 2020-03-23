import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {visit} from '@ember/test-helpers';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';

describe('Acceptance: Duplicate Email', function () {
  setupAcceptance({authenticate: false});

  setupSession(function (server) {
    this.loginUser = false;
    this.server = server;
  });

  it('shows page with duplicate email message', async function () {
    await visit('/auth/duplicate-email');
    await percySnapshot(this.test.fullTitle());
  });
});
