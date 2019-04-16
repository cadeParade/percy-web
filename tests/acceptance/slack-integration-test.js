import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import SlackIntegrationPage from 'percy-web/tests/pages/slack-integration-page';
import {percySnapshot} from 'ember-percy';

describe('Acceptance: Slack Integration', function() {
  setupAcceptance();
  let organization;

  setupSession(function(server) {
    organization = server.create('organization', 'withUser', 'withFreePlan');
  });

  it('renders', async function() {
    await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

    expect(SlackIntegrationPage.isVisible).to.equal(true);
    expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);

    await percySnapshot(this.test.fullTitle());
  });
});
