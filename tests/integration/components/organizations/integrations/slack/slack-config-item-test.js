import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import percySnapshot from '@percy/ember';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SlackConfigItem from 'percy-web/tests/pages/components/organizations/slack-config-item';
import {render} from '@ember/test-helpers';

describe('Integration: SlackConfigItem', function() {
  setupRenderingTest('slack-config-item', {
    integration: true,
  });

  let project;
  let projectOptions;

  beforeEach(function() {
    setupFactoryGuy(this);
    project = make('project');
    projectOptions = [
      {id: 'allProjects', name: 'All projects'},
      {id: project.id, name: project.name},
    ];
  });

  describe('with one notification type', function() {
    let slackIntegration;
    let slackIntegrationConfig;

    beforeEach(async function() {
      slackIntegration = make('slack-integration');
      slackIntegrationConfig = make('slack-integration-config', {
        slackIntegration,
        notificationTypes: ['approved'],
      });
      this.setProperties({
        projectOptions,
        slackIntegrationConfig,
      });
      await render(hbs`{{
        organizations/integrations/slack-config-item
        projectOptions=projectOptions
        slackIntegrationConfig=slackIntegrationConfig
      }}`);
    });

    it('renders correctly', async function() {
      expect(SlackConfigItem.notificationTypes.length).to.equal(1);
      expect(SlackConfigItem.projectName.isVisible).to.equal(true);
      expect(SlackConfigItem.editButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with four notification types', function() {
    let slackIntegration;
    let slackIntegrationConfig;

    beforeEach(async function() {
      slackIntegration = make('slack-integration');
      slackIntegrationConfig = make('slack-integration-config', {
        slackIntegration,
        notificationTypes: [
          'finished_auto_approved_branch',
          'approved',
          'finished_unreviewed_snapshots',
          'finished_no_changes',
        ],
      });
      this.setProperties({
        projectOptions,
        slackIntegrationConfig,
      });
      await render(hbs`{{
          organizations/integrations/slack-config-item
          projectOptions=projectOptions
          slackIntegrationConfig=slackIntegrationConfig
        }}`);
    });

    it('renders correctly', async function() {
      expect(SlackConfigItem.notificationTypes.length).to.equal(4);

      await percySnapshot(this.test.fullTitle());
    });
  });
});
