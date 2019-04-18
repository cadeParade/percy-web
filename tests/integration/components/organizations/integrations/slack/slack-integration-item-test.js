import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SlackIntegrationItem from 'percy-web/tests/pages/components/organizations/slack-integration-item'; // eslint-disable-line
import sinon from 'sinon';

describe('Integration: SlackIntegrationItem', function() {
  setupRenderingTest('slack-integration-item', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    SlackIntegrationItem.setContext(this);
  });

  describe('without a config', function() {
    let slackIntegration;
    let deleteSlackIntegrationStub;

    beforeEach(async function() {
      slackIntegration = make('slack-integration');
      deleteSlackIntegrationStub = sinon.stub();
      const createNewIntegrationConfig = null; // mock this
      this.setProperties({
        slackIntegration,
        deleteSlackIntegrationStub,
        createNewIntegrationConfig,
      });
      await this.render(hbs`{{
        organizations/integrations/slack-integration-item
        slackIntegration=slackIntegration
        deleteSlackIntegration=deleteSlackIntegrationStub
        createNewIntegrationConfig=createNewIntegrationConfig
      }}`);
    });

    it('renders the empty integration correctly', async function() {
      expect(SlackIntegrationItem.isVisible).to.equal(true);
      expect(SlackIntegrationItem.reminder.isVisible).to.equal(true);
      expect(SlackIntegrationItem.addProjectButton.isVisible).to.equal(true);
      expect(SlackIntegrationItem.deleteIntegrationButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });

    it('can delete the integration', async function() {
      await SlackIntegrationItem.deleteIntegrationButton.click();

      expect(deleteSlackIntegrationStub).to.have.been.called;
    });

    it.skip('can add a project');
  });
});
