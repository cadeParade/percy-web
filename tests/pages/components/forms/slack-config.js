import {clickable, collection, create, property} from 'ember-cli-page-object';

const SELECTORS = {
  CONTAINER: '[data-test-slack-config-form]',
  CANCEL_BUTTON: '[data-test-cancel-button]',
  SAVE_BUTTON: '[data-test-form-submit-button]',
  PROJECT: '[data-test-project-box]',
  NOTIFICATION_TYPES: '[data-test-checkbox-set-input]',
  DELETE_BUTTON: '[data-test-delete-button] button',
};

export const SlackConfig = {
  scope: SELECTORS.CONTAINER,

  cancelButton: {scope: SELECTORS.CANCEL_BUTTON},
  saveButton: {scope: SELECTORS.SAVE_BUTTON},
  project: {scope: SELECTORS.PROJECT},
  notificationTypes: collection(SELECTORS.NOTIFICATION_TYPES, {
    value: property('checked', 'input'),
    click: clickable('input'),
  }),
  deleteButton: {scope: SELECTORS.DELETE_BUTTON},
};

export default create(SlackConfig);
