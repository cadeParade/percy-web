import {expect} from 'chai';
import {describe, it, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import percySnapshot from '@percy/ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import AdminMode from 'percy-web/lib/admin-mode';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import IntegrationItem from 'percy-web/tests/pages/components/integration-item';
import mockIntercomService from 'percy-web/tests/helpers/mock-intercom-service';
import {render} from '@ember/test-helpers';

describe('Integration | Component | organizations/integrations/integration-item', function () {
  setupRenderingTest('organizations/integrations/integration-item', {
    integration: true,
  });

  beforeEach(function () {
    setupFactoryGuy(this);
    AdminMode.clear();
  });

  describe('with no integrations installed', function () {
    beforeEach(function () {
      const organization = make('organization');
      this.set('organization', organization);
    });

    it('shows the intall button for github', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github"
        @organization={{organization}} />`);

      expect(IntegrationItem.installButton.isVisible).to.equal(true);
      await percySnapshot(this.test);
    });

    it('shows the contact us button for github enterprise', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github_enterprise"
        @organization={{organization}} />`);

      expect(IntegrationItem.hasContactButton).to.equal(true);
      await percySnapshot(this.test);
    });

    it('shows the install button for gitlab', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="gitlab"
        @organization={{organization}} />`);

      expect(IntegrationItem.installButton.isVisible).to.equal(true);
      await percySnapshot(this.test);
    });

    it('shows the contact us button for gitlab self-hosted', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="gitlab_self_hosted"
        @organization={{organization}} />`);

      expect(IntegrationItem.installButton.isVisible, 'Install button is missing').to.equal(true);

      await percySnapshot(this.test);
    });

    it('links to the github enterprise form', async function () {
      const formLink = 'https://docs.percy.io/docs/github-enterprise';

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github_enterprise"
        @organization={{organization}} />`);

      expect(IntegrationItem.contactButtonLink).to.equal(formLink);
    });

    it('does not show the beta badge for github', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github"
        @organization={{organization}} />`);

      expect(IntegrationItem.hasBetaBadge).to.equal(false);
    });

    it('does not show the beta badge for github enterprise', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github_enterprise"
        @organization={{organization}} />`);

      expect(IntegrationItem.hasBetaBadge).to.equal(false);
    });

    it('shows the Connect button for Slack', async function () {
      await render(hbs`<Organizations::Integrations::IntegrationItem
          @integrationName="slack"
          @organization={{organization}} />`);

      expect(IntegrationItem.installButton.text).to.equal('Connect');
      await percySnapshot(this.test);
    });
  });

  describe('as an installed github integration item', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGithubIntegration');
      this.set('organization', organization);

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github"
        @organization={{organization}} />`);
    });

    it('shows the edit settings button', async function () {
      expect(IntegrationItem.hasEditButton).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('as an installed github enterprise integration item', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGithubEnterpriseIntegration');
      this.set('organization', organization);

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="github_enterprise"
        @organization={{organization}} />`);
    });

    it('shows the contact us button', async function () {
      const showSupportStub = sinon.stub();
      mockIntercomService(this, showSupportStub);

      expect(IntegrationItem.hasContactButton).to.equal(true);

      await percySnapshot(this.test);

      await IntegrationItem.clickContactButton();
      expect(showSupportStub).to.have.been.called;
    });
  });

  describe('as an installed gitlab integration item', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGitlabIntegration');
      this.set('organization', organization);

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="gitlab"
        @organization={{organization}} />`);
    });

    it('shows the edit settings button', async function () {
      expect(IntegrationItem.hasEditButton).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('as an installed Slack integration item', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withSlackIntegration');
      this.set('organization', organization);

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="slack"
        @organization={{organization}} />`);
    });

    it('shows the edit settings button', async function () {
      expect(IntegrationItem.hasEditButton).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('with an unauthorized gitlab integration', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withUnauthorizedGitlabIntegration');
      this.set('organization', organization);

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="gitlab"
        @integrationStatus="unauthorized"
        @organization={{organization}} />`);
    });

    it('has a badge to signify the integration is disabled', async function () {
      expect(IntegrationItem.hasDisabledBadge).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('with an invalid gitlab self-managed hostname', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withInvalidHostnameGitlabSelfHostedIntegration');
      this.set('organization', organization);

      await render(hbs`<Organizations::Integrations::IntegrationItem
        @integrationName="gitlab_self_hosted"
        @integrationStatus="invalid_hostname"
        @organization={{organization}} />`);
    });

    it('has a badge to signify the integration is disabled', async function () {
      expect(IntegrationItem.hasDisabledBadge).to.equal(true);
      await percySnapshot(this.test);
    });
  });
});
