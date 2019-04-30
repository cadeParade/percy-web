import {clickable, collection, create, is} from 'ember-cli-page-object';

const SELECTORS = {
  CONTAINER: '[data-test-slack-config-form]',
  CANCEL_BUTTON: '[data-test-cancel-button]',
  SAVE_BUTTON: '[data-test-form-submit-button]',
  PROJECT: '[data-test-project-box]',
  NOTIFICATION_TYPES: '[data-test-checkbox-set-input]',
};

export const SlackConfig = {
  scope: SELECTORS.CONTAINER,

  cancelButton: {scope: SELECTORS.CANCEL_BUTTON},
  saveButton: {scope: SELECTORS.SAVE_BUTTON},
  project: {scope: SELECTORS.PROJECT},
  notificationTypes: collection(SELECTORS.NOTIFICATION_TYPES, {
    value: is(':checked', 'input'),
    click: clickable('input'),
  }),
};

export default create(SlackConfig);
