import {collection, create} from 'ember-cli-page-object';
import SlackConfigItem from 'percy-web/tests/pages/components/organizations/slack-config-item'; // eslint-disable-line

export const SELECTORS = {
  CONTAINER: '[data-test-slack-integration-item]',
  REMINDER: '[data-test-reminder]',
  ADD_PROJECT_BUTTON: '[data-test-add-project-button]',
  DELETE_INTEGRATION_BUTTON: '[data-test-delete-integration-button]',
};

export const SlackIntegrationItem = {
  scope: SELECTORS.CONTAINER,
  reminder: {scope: SELECTORS.REMINDER},
  addProjectButton: {scope: SELECTORS.ADD_PROJECT_BUTTON},
  deleteIntegrationButton: {scope: SELECTORS.DELETE_INTEGRATION_BUTTON},
  configItems: collection(SlackConfigItem.scope, SlackConfigItem),
};

export default create(SlackIntegrationItem);
