import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make, makeList} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SlackIntegrationItem from 'percy-web/tests/pages/components/organizations/slack-integration-item'; // eslint-disable-line
import sinon from 'sinon';

describe('Integration: SlackIntegrationItem', function() {
  setupRenderingTest('slack-integration-item', {
    integration: true,
  });

  let project;
  let projectOptions;

  beforeEach(function() {
    setupFactoryGuy(this);
    SlackIntegrationItem.setContext(this);
    project = make('project');
    projectOptions = [
      {id: 'allProjects', name: 'All projects'},
      {id: Number(project.id), name: project.name},
    ];
  });

  describe('without a config', function() {
    let slackIntegration;
    let deleteSlackIntegrationStub;

    beforeEach(async function() {
      slackIntegration = make('slack-integration');
      deleteSlackIntegrationStub = sinon.stub();
      this.setProperties({
        projectOptions,
        slackIntegration,
        deleteSlackIntegrationStub,
      });
      await this.render(hbs`{{
        organizations/integrations/slack-integration-item
        projectOptions=projectOptions
        slackIntegration=slackIntegration
        deleteSlackIntegration=deleteSlackIntegrationStub
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
  });

  describe('with configs', function() {
    let slackIntegration;
    let deleteSlackIntegrationStub;

    beforeEach(async function() {
      slackIntegration = make('slack-integration');
      makeList('slack-integration-config', 3, {
        slackIntegration,
        notificationTypes: ['approved'],
      });
      deleteSlackIntegrationStub = sinon.stub();
      this.setProperties({
        projectOptions,
        slackIntegration,
        deleteSlackIntegrationStub,
      });
    });

    it('renders the integration correctly for All Projects', async function() {
      await this.render(hbs`{{
        organizations/integrations/slack-integration-item
        projectOptions=projectOptions
        slackIntegration=slackIntegration
        deleteSlackIntegration=deleteSlackIntegrationStub
      }}`);

      expect(SlackIntegrationItem.configItems.length).to.equal(3);

      await percySnapshot(this.test.fullTitle());
    });

    it('renders the integration correctly for a specific project', async function() {
      make('slack-integration-config', {
        slackIntegration,
        projectId: project.id,
      });
      await this.render(hbs`{{
        organizations/integrations/slack-integration-item
        projectOptions=projectOptions
        slackIntegration=slackIntegration
        deleteSlackIntegration=deleteSlackIntegrationStub
      }}`);
      expect(SlackIntegrationItem.configItems.length).to.equal(4);

      await percySnapshot(this.test.fullTitle());
    });
  });
});
