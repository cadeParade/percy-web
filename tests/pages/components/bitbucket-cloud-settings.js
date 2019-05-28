import {create, isVisible, text, visitable} from 'ember-cli-page-object';

const SELECTORS = {
  BITBUCKET_CLOUD_INTEGRATION: '[data-test-bitbucket-cloud-settings]',
  BITBUCKET_CLOUD_APP_INSTALL_BUTTON: '[data-test-bitbucket-cloud-app-install-button]',
  BITBUCKET_CLOUD_APP_SUCCESS_STATE: '[data-test-bitbucket-cloud-app-install-success]',
};

export const BitbucketCloudSettings = {
  visitBitbucketCloudSettings: visitable('/organizations/:orgSlug/integrations/bitbucket-cloud'),
  integrationText: text(SELECTORS.BITBUCKET_CLOUD_INTEGRATION),
  isBitbucketCloudAppInstallButtonVisible: isVisible(SELECTORS.BITBUCKET_CLOUD_APP_INSTALL_BUTTON),
  isBitbucketCloudAppSuccessStateVisible: isVisible(SELECTORS.BITBUCKET_CLOUD_APP_SUCCESS_STATE),
};

export default create(BitbucketCloudSettings);
