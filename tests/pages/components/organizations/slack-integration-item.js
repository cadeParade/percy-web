import {create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-slack-integration-item]',
  REMINDER: '[data-test-reminder]',
  ADD_PROJECT_BUTTON: '[data-test-add-project] [data-test-percy-btn]',
  DELETE_INTEGRATION_BUTTON: '[data-test-delete-integration-button]',
};

export const SlackIntegrationItem = {
  scope: SELECTORS.CONTAINER,
  reminder: {scope: SELECTORS.REMINDER},
  addProjectButton: {scope: SELECTORS.ADD_PROJECT_BUTTON},
  deleteIntegrationButton: {scope: SELECTORS.DELETE_INTEGRATION_BUTTON},
};

export default create(SlackIntegrationItem);
