import {text, create, collection, clickable, property} from 'ember-cli-page-object';

const SELECTORS = {
  WEBHOOK_CONFIG_LIST: '[data-test-webhook-config-list]',
  WEBHOOK_CONFIG_ITEM: '[data-test-webhook-config-item]',
  NEW_WEBHOOK_CONFIG_BUTTON: '[data-test-new-webhook-config]',
};

export const WebhookConfigList = {
  scope: SELECTORS.WEBHOOK_CONFIG_LIST,

  webhookConfigs: collection(SELECTORS.WEBHOOK_CONFIG_ITEM, {
    url: text('[data-test-webhook-config-url]'),
  }),

  newWebhookConfig: clickable(SELECTORS.NEW_WEBHOOK_CONFIG_BUTTON),
  isNewWebhookConfigButtonDisabled: property('disabled', SELECTORS.NEW_WEBHOOK_CONFIG_BUTTON),
};

export default create(WebhookConfigList);
