import setupAcceptance, {setupSession} from 'percy-web/tests/helpers/setup-acceptance';
import BitbucketCloudSettings from 'percy-web/tests/pages/components/bitbucket-cloud-settings';
import {beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {currentRouteName} from '@ember/test-helpers';

describe('Acceptance: Bitbucket Cloud App Install', function () {
  setupAcceptance();

  describe('with a non-admin user', function () {
    let organization;
    setupSession(function (server) {
      organization = server.create('organization', 'withUser');
    });

    beforeEach(async function () {
      await BitbucketCloudSettings.visitBitbucketCloudSettings({orgSlug: organization.slug});
    });

    it('shows Bitbucket Cloud integration installation page', async function () {
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
    });

    it('does not show "Install Bitbucket" button', async function () {
      expect(BitbucketCloudSettings.isBitbucketCloudAppInstallButtonVisible).to.equal(false);
      expect(BitbucketCloudSettings.integrationText).to.equal(
        'This feature requires organization admin permissions.',
      );
      await percySnapshot(this.test);
    });
  });

  describe('with an admin user', function () {
    let organization;
    setupSession(function (server) {
      organization = server.create('organization', 'withAdminUser');
    });

    beforeEach(async function () {
      await BitbucketCloudSettings.visitBitbucketCloudSettings({orgSlug: organization.slug});
    });

    it('shows Bitbucket Cloud integration installation page', async function () {
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
    });

    it('shows "Install Bitbucket" button when bitbucket cloud is not installed', async function () {
      expect(BitbucketCloudSettings.isBitbucketCloudAppInstallButtonVisible).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('after bitbucket cloud app installation is complete', function () {
    let organization;
    setupSession(function (server) {
      organization = server.create(
        'organization',
        'withBitbucketCloudIntegration',
        'withAdminUser',
      );
    });

    it('shows the installed state when the install is in successful', async function () {
      await BitbucketCloudSettings.visitBitbucketCloudSettings({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );

      expect(BitbucketCloudSettings.isBitbucketCloudAppSuccessStateVisible).to.equal(true);

      await percySnapshot(this.test);
    });
  });
});
