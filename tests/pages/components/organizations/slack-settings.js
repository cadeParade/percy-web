import {collection, create} from 'ember-cli-page-object';
import SlackIntegrationItem from 'percy-web/tests/pages/components/organizations/slack-integration-item'; // eslint-disable-line

export const SELECTORS = {
  CONTAINER: '[data-test-slack-settings]',
  ADD_CHANNEL_BUTTON: '[data-test-add-channel] [data-test-percy-btn]',
};

export const SlackSettings = {
  scope: SELECTORS.CONTAINER,
  addChannelButton: {scope: SELECTORS.ADD_CHANNEL_BUTTON},
  integrationItems: collection(SlackIntegrationItem.scope, SlackIntegrationItem),
};

export default create(SlackSettings);
