import {create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-slack-settings]',
  ADD_CHANNEL_BUTTON: '[data-test-add-channel] [data-test-percy-btn]',
};

export const SlackSettings = {
  scope: SELECTORS.CONTAINER,
  addChannelButton: {scope: SELECTORS.ADD_CHANNEL_BUTTON},
};

export default create(SlackSettings);
