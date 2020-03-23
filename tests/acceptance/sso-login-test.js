import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {visit} from '@ember/test-helpers';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import SsoLoginPage from 'percy-web/tests/pages/sso-login-page';
import {beforeEach} from 'mocha';
import sinon from 'sinon';

describe('Acceptance: SSO Login', function () {
  setupAcceptance({authenticate: false});
  let connectionName;
  let organizationName;
  let provider;
  let url;
  let supportMessage;

  setupSession(function (server) {
    this.loginUser = false;
    const organization = server.create('organization');
    const samlIntegration = server.create('samlIntegration', {organization});
    organizationName = organization.name;
    connectionName = samlIntegration.connectionName;
    provider = 'Okta';
  });

  function functionsCorrectly() {
    it('displays the SSO login screen and pre-populates the support chat box', async function () {
      window.Intercom = sinon.stub();

      await visit(url);
      await percySnapshot(this.test.fullTitle());
      await SsoLoginPage.clickShowSupportLink();

      expect(window.Intercom).to.have.been.calledWith('showNewMessage', supportMessage);
    });
  }

  describe('when SSO is required', function () {
    beforeEach(function () {
      url =
        `/auth/sso-login?connectionName=${connectionName}&organizationName=${organizationName}` +
        `&provider=${provider}&required=true`;
      supportMessage = `Hi! I'd like help logging into my ${organizationName} ${provider} account.`;
    });

    describe('uses organization-specific information', function () {
      functionsCorrectly();
    });
  });

  describe('when SSO not required', function () {
    beforeEach(function () {
      url =
        `/auth/sso-login?connectionName=${connectionName}&organizationName=${organizationName}` +
        `&provider=${provider}`;
      supportMessage = `Hi! I'd like help logging into my ${organizationName} ${provider} account.`;
    });

    describe('uses organization-specific information', function () {
      functionsCorrectly();
    });
  });

  describe('when no params are provided', function () {
    beforeEach(function () {
      url = '/auth/sso-login';
      supportMessage = "Hi! I'd like help logging into my  SSO account.";
    });

    describe('uses generic information', function () {
      functionsCorrectly();
    });
  });
});
