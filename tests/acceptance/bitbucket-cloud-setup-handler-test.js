import setupAcceptance, {setupSession} from 'percy-web/tests/helpers/setup-acceptance';
import BitbucketCloudSettings from 'percy-web/tests/pages/components/bitbucket-cloud-settings';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {currentRouteName, visit, findAll} from '@ember/test-helpers';
import {resolve} from 'rsvp';
import sinon from 'sinon';

describe('Acceptance: Bitbucket Cloud Setup Handler', function () {
  setupAcceptance();

  let organization;
  setupSession(function (server) {
    organization = server.create('organization', 'withAdminUser');
  });

  describe('with the connection cancelled', function () {
    it('shows integration cancelled', async function () {
      await visit(
        `/organizations/${organization.slug}/setup/bitbucket-cloud-integration?` +
          'error=access_denied',
      );
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
      expect(BitbucketCloudSettings.isBitbucketCloudAppInstallButtonVisible).to.equal(true);
      const flashMessages = findAll('.flash-message.flash-message-info');
      expect(flashMessages).to.have.length(1);
      expect(
        flashMessages[0].innerText.includes('Bitbucket Cloud integration cancelled.'),
      ).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('with an error', function () {
    it('shows integration error', async function () {
      await visit(
        `/organizations/${organization.slug}/setup/bitbucket-cloud-integration?` +
          'error=test_error&error_description=test_error_description',
      );
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
      expect(BitbucketCloudSettings.isBitbucketCloudAppInstallButtonVisible).to.equal(true);
      const flashMessages = findAll('.flash-message.flash-message-danger');
      expect(flashMessages).to.have.length(1);
      expect(
        flashMessages[0].innerText.includes(
          'Error connecting to Bitbucket Cloud: test_error: test_error_description',
        ),
      ).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('with a missing client key', function () {
    it('shows integration error', async function () {
      await visit(`/organizations/${organization.slug}/setup/bitbucket-cloud-integration`);
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
      expect(BitbucketCloudSettings.isBitbucketCloudAppInstallButtonVisible).to.equal(true);
      const flashMessages = findAll('.flash-message.flash-message-danger');
      expect(flashMessages).to.have.length(1);
      expect(
        flashMessages[0].innerText.includes(
          'Error connecting to Bitbucket Cloud: clientKey is missing.',
        ),
      ).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('with an incorrect client key', function () {
    it('shows integration error', async function () {
      await visit(
        `/organizations/${organization.slug}/setup/bitbucket-cloud-integration?` +
          'clientKey=test_missing_client_key',
      );
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
      expect(BitbucketCloudSettings.isBitbucketCloudAppInstallButtonVisible).to.equal(true);
      const flashMessages = findAll('.flash-message.flash-message-danger');
      expect(flashMessages).to.have.length(1);
      expect(
        flashMessages[0].innerText.includes(
          'Error creating Bitbucket Integration. Error: The adapter rejected the commit ' +
            'because it was invalid',
        ),
      ).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('with a valid client key', function () {
    it('saves the integration and redirects to the bitbucket settings page', async function () {
      let store = this.owner.lookup('service:store');
      let integrationStub = sinon.stub();
      integrationStub.save = sinon.stub().returns(resolve());
      sinon.stub(store, 'createRecord').returns(integrationStub);
      await visit(
        `/organizations/${organization.slug}/setup/bitbucket-cloud-integration?` +
          'clientKey=test_valid_client_key',
      );
      expect(integrationStub.save).to.have.been.called;
      expect(currentRouteName()).to.equal(
        'organizations.organization.integrations.bitbucket-cloud',
      );
    });
  });
});
