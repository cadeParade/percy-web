import {create} from 'ember-cli-page-object';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line

export const SELECTORS = {
  CONTAINER: '[data-test-usage-section-container]',
  GRAPH_CONTAINER: '[data-test-graph-container]',
};

export const BillingSection = {
  scope: SELECTORS.CONTAINER,

  usageNotificationSettingForm: UsageNotificationSettingForm,

  usageGraphContainer: {scope: SELECTORS.GRAPH_CONTAINER},
};

export default create(BillingSection);
