import {beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import SlackIntegrationPage from 'percy-web/tests/pages/organizations/slack-integration-page';
import utils from 'percy-web/lib/utils';
import sinon from 'sinon';

describe('Acceptance: Slack Integration', function() {
  setupAcceptance();
  let organization;

  setupSession(function(server) {
    organization = server.create('organization', 'withUser', 'withFreePlan');
  });

  describe('without an integration', function() {
    it('renders', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.isVisible).to.equal(true);
      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with an integration without configs', function() {
    beforeEach(function() {
      server.create('slackIntegration', {organization});
    });

    it('renders correctly', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.isVisible).to.equal(true);
      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
      expect(SlackIntegrationPage.slackIntegrationItems[0].isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });

    it('can delete the integration', async function() {
      let confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
      await SlackIntegrationPage.slackIntegrationItems[0].deleteIntegrationButton.click();

      expect(SlackIntegrationPage.slackIntegrationItems.length).to.equal(0);

      await percySnapshot(this.test.fullTitle());

      confirmationAlertStub.restore();
    });
  });

  describe('with multiple integrations without configs', function() {
    const numberOfIntegrations = 2;

    beforeEach(function() {
      server.createList('slackIntegration', numberOfIntegrations, {organization});
    });

    it('renders correctly', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.isVisible).to.equal(true);
      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
      expect(SlackIntegrationPage.slackIntegrationItems.length).to.equal(numberOfIntegrations);

      await percySnapshot(this.test.fullTitle());
    });
  });
});
