import {create} from 'ember-cli-page-object';
import {keyDown} from 'ember-keyboard/test-support/test-helpers';

const SELECTORS = {
  SCOPE: '[data-test-confirm-dialog]',
  CANCEL: '[data-test-percy-btn-label=cancelConfirm]',
  CONFIRM: '[data-test-percy-btn-label=goAhead]',
};

export const confirmDialog = {
  testContainer: '#ember-testing-container',
  resetScope: true,
  scope: SELECTORS.SCOPE,
  confirm: {scope: SELECTORS.CONFIRM},
  cancel: {scope: SELECTORS.CANCEL},

  async pressEnter() {
    return await keyDown('Enter');
  },

  async pressEscape() {
    return await keyDown('Escape');
  },
};

export default create(confirmDialog);
