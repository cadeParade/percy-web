import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {percySnapshot} from 'ember-percy';
import {make} from 'ember-data-factory-guy';
import SlackSettings from 'percy-web/tests/pages/components/organizations/slack-settings';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

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

    it('renders the Add Slack Channel button', async function() {
      expect(SlackSettings.addChannelButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });
});
