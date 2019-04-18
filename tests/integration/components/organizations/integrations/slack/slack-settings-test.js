import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SlackSettings from 'percy-web/tests/pages/components/organizations/slack-settings';

describe('Integration: SlackSettings', function() {
  setupRenderingTest('slack-settings', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    SlackSettings.setContext(this);
  });

  describe('without an integration', function() {
    beforeEach(async function() {
      const organization = make('organization');
      this.setProperties({organization});
      await this.render(hbs`{{
        organizations/integrations/slack-settings
        organization=organization
      }}`);
    });

    it('renders correctly', async function() {
      expect(SlackSettings.addChannelButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with an integration without configs', function() {
    beforeEach(async function() {
      const organization = make('organization');
      make('slack-integration', {organization});
      this.setProperties({organization});
      await this.render(hbs`{{
        organizations/integrations/slack-settings
        organization=organization
      }}`);
    });

    it('renders correctly', async function() {
      expect(SlackSettings.addChannelButton.isVisible).to.equal(true);
      expect(SlackSettings.slackIntegrationItems[0].isVisible).to.equal(true);
      expect(SlackSettings.slackIntegrationItems[0].reminder.isVisible).to.equal(true);
      expect(SlackSettings.slackIntegrationItems[0].addProjectButton.isVisible).to.equal(true);
      expect(SlackSettings.slackIntegrationItems[0].deleteIntegrationButton.isVisible).to.equal(
        true,
      );

      await percySnapshot(this.test.fullTitle());
    });
  });
});
