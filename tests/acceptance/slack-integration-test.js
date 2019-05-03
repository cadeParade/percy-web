import {afterEach, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import sinon from 'sinon';
import {currentRouteName, visit} from '@ember/test-helpers';
import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import utils from 'percy-web/lib/utils';
import SlackIntegrationPage from 'percy-web/tests/pages/organizations/slack-integration-page';
import SlackConfigForm from 'percy-web/tests/pages/components/forms/slack-config';
import IntegrationsIndexPage from 'percy-web/tests/pages/integrations-index-page';
import {withVariation} from 'ember-launch-darkly/test-support/helpers/with-variation';

describe('Acceptance: Slack Integration', function() {
  setupAcceptance();
  let organization;

  setupSession(function(server) {
    organization = server.create('organization', 'withUser', 'withPaidPlan');
    server.create('project', {organization});
  });

  describe('after connecting a channel', function() {
    it('redirects to the new config form', async function() {
      await visit(`/organizations/${organization.slug}/setup/slack-integration`);

      expect(SlackConfigForm.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('without an integration', function() {
    let windowStub;

    beforeEach(function() {
      windowStub = sinon.stub(utils, 'replaceWindowLocation').returns(true);
      withVariation(this.owner, 'slack-integration', true);
    });

    afterEach(function() {
      windowStub.restore();
    });

    it('integrations list page kicks off the OAuth process', async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});

      await IntegrationsIndexPage.slackIntegration.install();

      expect(windowStub).to.have.been.calledWith('fake_slack_oauth_url');
      await percySnapshot(this.test.fullTitle());
    });

    it('renders', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.isVisible).to.equal(true);
      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with an integration without configs', function() {
    let windowStub;

    beforeEach(function() {
      server.create('slackIntegration', {organization});
      windowStub = sinon.stub(utils, 'replaceWindowLocation').returns(true);
    });
    afterEach(function() {
      windowStub.restore();
    });

    it('renders correctly', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
      expect(SlackIntegrationPage.integrationItems[0].isVisible).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });

    it('can delete the integration', async function() {
      let confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
      await SlackIntegrationPage.integrationItems[0].deleteIntegrationButton.click();

      expect(SlackIntegrationPage.integrationItems.length).to.equal(0);

      await percySnapshot(this.test.fullTitle());

      confirmationAlertStub.restore();
    });

    it('can begin the Slack OAuth process', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      await SlackIntegrationPage.addChannelButton.click();

      expect(windowStub).to.have.been.calledWith('fake_slack_oauth_url');
      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with multiple integrations without configs', function() {
    const numberOfIntegrations = 2;

    beforeEach(function() {
      server.createList('slackIntegration', numberOfIntegrations, {organization});
    });

    it('renders correctly', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
      expect(SlackIntegrationPage.integrationItems.length).to.equal(numberOfIntegrations);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with an integration with configs', function() {
    beforeEach(function() {
      const slackIntegration = server.create('slackIntegration', {organization});
      server.createList('slackIntegrationConfig', 2, {slackIntegration});
      server.create('slackIntegrationConfig', {
        slackIntegration,
        projectId: server.create('project', {organization}).id,
        notificationTypes: [
          'approved',
          'finished_unreviewed_snapshots',
          'finished_no_changes',
          'finished_auto_approved_branch',
        ],
      });
    });

    it('renders correctly', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

      expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

      await percySnapshot(this.test.fullTitle());
    });

    it('can add a project', async function() {
      server.post('/slack-integrations/:slack_integration_id/slack-integration-configs', function(
        schema,
      ) {
        const attrs = this.normalizedRequestAttrs();
        expect(attrs.projectId).to.equal(null);
        return schema.slackIntegrationConfigs.create({
          slackIntegrationId: attrs.slackIntegrationId,
          projectId: attrs.projectId,
          notificationTypes: attrs.notificationTypes,
        });
      });

      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

      await SlackIntegrationPage.integrationItems[0].addProjectButton.click();
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.slack.slack-config',
      );
      await percySnapshot(this.test.fullTitle() + ' | new slack-config form');
      await SlackConfigForm.saveButton.click();

      expect(currentRouteName()).to.equal('organizations.organization.integrations.slack.index');
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(4);
      await percySnapshot(this.test.fullTitle());
    });

    it('can edit a project', async function() {
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

      await SlackIntegrationPage.integrationItems[0].configItems[0].editButton.click();
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.slack.slack-config',
      );
      await percySnapshot(this.test.fullTitle() + ' | edit slack-config form');

      await SlackConfigForm.notificationTypes[3].click();
      await SlackConfigForm.saveButton.click();
      expect(currentRouteName()).to.equal('organizations.organization.integrations.slack.index');
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

      await percySnapshot(this.test.fullTitle());
    });

    it('can delete a config', async function() {
      let confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
      await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);
      await SlackIntegrationPage.integrationItems[0].configItems[0].editButton.click();
      await percySnapshot(this.test.fullTitle() + ' | edit slack-config form');

      await SlackConfigForm.deleteButton.click();

      expect(currentRouteName()).to.equal('organizations.organization.integrations.slack.index');
      expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(2);

      await percySnapshot(this.test.fullTitle());

      confirmationAlertStub.restore();
    });
  });
});
