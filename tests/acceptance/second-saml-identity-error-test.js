import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {visit} from '@ember/test-helpers';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import SecondSamlIdentityErrorPage from 'percy-web/tests/pages/second-saml-identity-error-page';
import {beforeEach} from 'mocha';
import sinon from 'sinon';
import faker from 'faker';

describe('Acceptance: Second SAML identity error', function () {
  setupAcceptance({authenticate: false});
  let connectionName;
  let newSsoProfileEmail;
  let organizationName;
  let provider;
  let userEmail;
  let url;
  let supportMessage;

  setupSession(function (server) {
    this.loginUser = false;
    const organization = server.create('organization');
    const samlIntegration = server.create('samlIntegration', {organization});
    organizationName = organization.name;
    connectionName = samlIntegration.connectionName;
    newSsoProfileEmail = faker.internet.email();
    userEmail = faker.internet.email();
    provider = 'Okta';
  });

  beforeEach(function () {
    url =
      `/auth/second-saml-identity-error?connectionName=n${connectionName}` +
      `&newSsoProfileEmail=${newSsoProfileEmail}&organizationName=${organizationName}` +
      `&provider=${provider}&userEmail=${userEmail}`;
    supportMessage =
      `Hi! I'd like help logging into my ${organizationName} ${provider} account, but am ` +
      'receiving an error regarding a conflicting login identity.';
  });

  it('displays the error screen and pre-populates the support chat box', async function () {
    window.Intercom = sinon.stub();

    await visit(url);
    await percySnapshot(this.test.fullTitle());
    await SecondSamlIdentityErrorPage.clickShowSupportLink();

    expect(window.Intercom).to.have.been.calledWith('showNewMessage', supportMessage);
  });
});
