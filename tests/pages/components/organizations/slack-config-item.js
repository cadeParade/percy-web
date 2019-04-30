import {collection, create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-slack-config-item]',
  PROJECT_NAME: '[data-test-project-name]',
  EDIT_BUTTON: '[data-test-edit-button]',
  NOTIFICATION_TYPE: '[data-test-notification-type]',
};

export const SlackConfigItem = {
  scope: SELECTORS.CONTAINER,
  projectName: {scope: SELECTORS.PROJECT_NAME},
  notificationTypes: collection(SELECTORS.NOTIFICATION_TYPE),
  editButton: {scope: SELECTORS.EDIT_BUTTON},
};

export default create(SlackConfigItem);
