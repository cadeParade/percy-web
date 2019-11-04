import setupAcceptance, {setupSession} from 'percy-web/tests/helpers/setup-acceptance';
import IntegrationsIndexPage from 'percy-web/tests/pages/integrations-index-page';
import {beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import {currentRouteName} from '@ember/test-helpers';

describe('Acceptance: Integrations Settings Page', function() {
  setupAcceptance();

  describe('with a non-admin user', function() {
    let organization;
    setupSession(function(server) {
      organization = server.create('organization', 'withUser');
    });

    beforeEach(async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
    });

    it('shows integrations page', async function() {
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await percySnapshot(this.test);
    });
  });

  describe('with an admin user', function() {
    let organization;
    setupSession(function(server) {
      organization = server.create('organization', 'withAdminUser');
    });

    it('shows integrations page', async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await percySnapshot(this.test);
    });

    it('navigates to the Bitbucket Cloud settings page when install clicked', async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await IntegrationsIndexPage.bitbucketCloudIntegration.install();
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
    });

    describe('when there is an okta integration', function() {
      beforeEach(async function() {
        server.create('samlIntegration', {organization});
        await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
      });

      it('navigates to the Okta settings page', async function() {
        expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
        await percySnapshot(this.test.fullTitle() + 'index page with okta integration');
        await IntegrationsIndexPage.oktaIntegration.edit();
        await percySnapshot(this.test.fullTitle() + 'okta settings page');
      });
    });
  });

  describe('after all integrations installed', function() {
    let organization;
    setupSession(function(server) {
      organization = server.create(
        'organization',
        'withBitbucketCloudIntegration',
        'withGithubIntegration',
        'withGitlabIntegration',
        'withGitlabSelfHostedIntegration',
        'withSlackIntegration',
        'withAdminUser',
      );
    });

    beforeEach(async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
    });

    it('shows all integrations installed', async function() {
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');

      expect(IntegrationsIndexPage.hasBitbucketCloudIntegration).to.equal(true);
      expect(IntegrationsIndexPage.hasGithubIntegration).to.equal(true);
      expect(IntegrationsIndexPage.hasGitlabIntegration).to.equal(true);
      expect(IntegrationsIndexPage.hasGitlabSelfHostedIntegration).to.equal(true);
      expect(IntegrationsIndexPage.hasSlackIntegration).to.equal(true);
      await percySnapshot(this.test);
    });
  });
});
