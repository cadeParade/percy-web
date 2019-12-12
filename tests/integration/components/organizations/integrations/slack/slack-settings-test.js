import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make, makeList} from 'ember-data-factory-guy';
import percySnapshot from '@percy/ember';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import SlackSettings from 'percy-web/tests/pages/components/organizations/slack-settings';
import {render} from '@ember/test-helpers';

describe('Integration: SlackSettings', function() {
  setupRenderingTest('slack-settings', {
    integration: true,
  });

  let project;
  let projectOptions;

  beforeEach(function() {
    setupFactoryGuy(this);
    SlackSettings.setContext(this);
    project = make('project');
    projectOptions = [
      {id: 'allProjects', name: 'All projects'},
      {id: project.id, name: project.name},
    ];
  });

  describe('without an integration', function() {
    beforeEach(async function() {
      const organization = make('organization');
      this.setProperties({organization, projectOptions});
      await render(hbs`{{
        organizations/integrations/slack-settings
        projectOptions=projectOptions
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
      this.setProperties({organization, projectOptions});
      await render(hbs`{{
        organizations/integrations/slack-settings
        projectOptions=projectOptions
        organization=organization
      }}`);
    });

    it('renders correctly', async function() {
      expect(SlackSettings.addChannelButton.isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].reminder.isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].addProjectButton.isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].deleteIntegrationButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with an integration with configs', function() {
    beforeEach(async function() {
      const organization = make('organization');
      const slackIntegration = make('slack-integration', {organization});
      makeList('slack-integration-config', 3, {slackIntegration});
      this.setProperties({organization, projectOptions});
      await render(hbs`{{
        organizations/integrations/slack-settings
        projectOptions=projectOptions
        organization=organization
      }}`);
    });

    it('renders correctly', async function() {
      expect(SlackSettings.addChannelButton.isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].reminder.isVisible).to.equal(false);
      expect(SlackSettings.integrationItems[0].addProjectButton.isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].deleteIntegrationButton.isVisible).to.equal(true);
      expect(SlackSettings.integrationItems[0].configItems.length).to.equal(3);

      await percySnapshot(this.test.fullTitle());
    });
  });
});
