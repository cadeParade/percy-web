import {afterEach, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import sinon from 'sinon';
import {currentRouteName, visit} from '@ember/test-helpers';
import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import utils from 'percy-web/lib/utils';
import SlackIntegrationPage from 'percy-web/tests/pages/organizations/slack-integration-page';
import SlackPermissionsWarning from 'percy-web/tests/pages/components/organizations/slack-permissions-warning'; // eslint-disable-line
import SlackConfigForm from 'percy-web/tests/pages/components/forms/slack-config';
import IntegrationsIndexPage from 'percy-web/tests/pages/integrations-index-page';

describe('Acceptance: Slack Integration', function () {
  setupAcceptance();
  let organization;
  let adminUser;

  describe('when currentUser is an Admin', function () {
    setupSession(function (server) {
      organization = server.create('organization', 'withPaidPlan');
      adminUser = server.create('user');
      server.create('organizationUser', {
        organization,
        user: adminUser,
        role: 'admin',
      });
      server.create('project', {organization});
    });

    describe('after connecting a channel', function () {
      it('redirects to the new config form', async function () {
        await visit(`/organizations/${organization.slug}/setup/slack-integration`);

        expect(SlackConfigForm.isVisible).to.equal(true);

        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('without an integration', function () {
      let windowStub;

      beforeEach(function () {
        windowStub = sinon.stub(utils, 'replaceWindowLocation').returns(true);
      });

      afterEach(function () {
        windowStub.restore();
      });

      it('integrations page starts the OAuth process', async function () {
        await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});

        await IntegrationsIndexPage.slackIntegration.install();

        expect(windowStub).to.have.been.calledWith('fake_slack_oauth_url');
        await percySnapshot(this.test.fullTitle());
      });

      it('renders', async function () {
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

        expect(SlackIntegrationPage.isVisible).to.equal(true);
        expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);

        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('with an integration without configs', function () {
      let windowStub;

      beforeEach(function () {
        server.create('slackIntegration', {organization});
        windowStub = sinon.stub(utils, 'replaceWindowLocation').returns(true);
      });
      afterEach(function () {
        windowStub.restore();
      });

      it('renders correctly', async function () {
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

        expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
        expect(SlackIntegrationPage.integrationItems[0].isVisible).to.equal(true);

        await percySnapshot(this.test.fullTitle());
      });

      it('can delete the integration', async function () {
        let confirmationAlertStub = sinon.stub(utils, 'confirmMessage').returns(true);
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
        await SlackIntegrationPage.integrationItems[0].deleteIntegrationButton.click();

        expect(SlackIntegrationPage.integrationItems.length).to.equal(0);

        await percySnapshot(this.test.fullTitle());

        confirmationAlertStub.restore();
      });

      it('can start the OAuth process', async function () {
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

        await SlackIntegrationPage.addChannelButton.click();

        expect(windowStub).to.have.been.calledWith('fake_slack_oauth_url');
        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('with multiple integrations without configs', function () {
      const numberOfIntegrations = 2;

      beforeEach(function () {
        server.createList('slackIntegration', numberOfIntegrations, {organization});
      });

      it('renders correctly', async function () {
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

        expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
        expect(SlackIntegrationPage.integrationItems.length).to.equal(numberOfIntegrations);

        await percySnapshot(this.test.fullTitle());
      });
    });

    describe('with an integration with configs', function () {
      beforeEach(function () {
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

      it('renders correctly', async function () {
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

        expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(true);
        expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

        await percySnapshot(this.test.fullTitle());
      });

      it('can add a project', async function () {
        // This is needed to verify that projectId is null when creating an All Projects config
        server.post(
          '/slack-integrations/:slack_integration_id/slack-integration-configs',
          function (schema) {
            const attrs = this.normalizedRequestAttrs();
            expect(attrs.projectId).to.equal(null);
            return schema.slackIntegrationConfigs.create({
              slackIntegrationId: attrs.slackIntegrationId,
              projectId: attrs.projectId,
              notificationTypes: attrs.notificationTypes,
            });
          },
        );

        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
        expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

        await SlackIntegrationPage.integrationItems[0].addProjectButton.click();
        expect(currentRouteName()).to.equal(
          'organizations.organization.integrations.slack.slack-config',
        );
        await SlackConfigForm.saveButton.click();

        expect(currentRouteName()).to.equal('organizations.organization.integrations.slack.index');
        expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(4);
      });

      it('when you cancel when adding a project, a new record is not displayed', async function () {
        await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});
        expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);

        await SlackIntegrationPage.integrationItems[0].addProjectButton.click();

        await percySnapshot(this.test.fullTitle() + ' | new slack-config form');
        await SlackConfigForm.cancelButton.click();

        expect(SlackIntegrationPage.integrationItems[0].configItems.length).to.equal(3);
        await percySnapshot(this.test.fullTitle());
      });

      it('can edit a project', async function () {
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

      it('can delete a config', async function () {
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

  describe('when currentUser is a Member', function () {
    describe('without an integration', function () {
      setupSession(function (server) {
        organization = server.create('organization', 'withPaidPlan', 'withUser');
        server.create('project', {organization});
      });

      describe('integrations page', function () {
        let windowStub;

        beforeEach(function () {
          windowStub = sinon.stub(utils, 'replaceWindowLocation').returns(true);
        });

        afterEach(function () {
          windowStub.restore();
        });

        it('integrations page does not start the OAuth process', async function () {
          await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});

          await IntegrationsIndexPage.slackIntegration.install();

          expect(windowStub).to.not.have.been.calledWith('fake_slack_oauth_url');
          expect(currentRouteName()).to.equal('organizations.organization.integrations.index');

          await percySnapshot(this.test.fullTitle());
        });
      });
    });

    describe('with an integration installed', function () {
      let slackIntegration;

      setupSession(function (server) {
        organization = server.create('organization', 'withPaidPlan', 'withUser');
        server.create('project', {organization});
        slackIntegration = server.create('slackIntegration', {organization});
      });

      describe('Slack integrations page', function () {
        it('does not render integrations', async function () {
          await SlackIntegrationPage.visitSlackIntegration({orgSlug: organization.slug});

          expect(SlackIntegrationPage.addChannelButton.isVisible).to.equal(false);
          expect(SlackIntegrationPage.integrationItems[0].isVisible).to.equal(false);
          expect(SlackPermissionsWarning.isVisible).to.equal(true);

          await percySnapshot(this.test.fullTitle());
        });
      });

      describe('Slack config form', function () {
        it('does not render', async function () {
          await visit(
            `/organizations/${organization.slug}/integrations/slack/${ // eslint-disable-line
              slackIntegration.id
            }/configs/new`,
          );

          expect(SlackConfigForm.saveButton.isVisible).to.equal(false);
          expect(SlackPermissionsWarning.isVisible).to.equal(true);

          await percySnapshot(this.test.fullTitle());
        });
      });
    });
  });
});
