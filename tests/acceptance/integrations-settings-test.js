import setupAcceptance, {setupSession} from 'percy-web/tests/helpers/setup-acceptance';
import IntegrationsIndexPage from 'percy-web/tests/pages/integrations-index-page';
import {beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import {currentRouteName} from '@ember/test-helpers';
import {withVariation} from 'ember-launch-darkly/test-support/helpers/with-variation';

describe('Acceptance: Integrations Settings Page', function() {
  setupAcceptance();

  beforeEach(function() {
    withVariation(this.owner, 'slack-integration', true);
    withVariation(this.owner, 'bitbucket-cloud-integration', true);
  });

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

    beforeEach(async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
    });

    it('shows integrations page', async function() {
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await percySnapshot(this.test);
    });

    it('navigates to the Bitbucket Cloud settings page when install clicked', async function() {
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await IntegrationsIndexPage.bitbucketCloudIntegration.install();
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
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
        'withAdminUser',
      );
    });

    beforeEach(async function() {
      await IntegrationsIndexPage.visitIntegrationsPage({orgSlug: organization.slug});
    });

    it('shows all integrations installed', async function() {
      expect(currentRouteName()).to.equal('organizations.organization.integrations.index');
      await percySnapshot(this.test);
    });
  });
});
