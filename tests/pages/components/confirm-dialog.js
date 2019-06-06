import {create} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-confirm-dialog]',
  CANCEL: '[data-test-percy-btn-label=cancelConfirm]',
  CONFIRM: '[data-test-percy-btn-label=goAhead]',
};

export const confirmDialog = {
  scope: SELECTORS.SCOPE,
  confirm: {scope: SELECTORS.CONFIRM},
  cancel: {scope: SELECTORS.CANCEL},
};

export default create(confirmDialog);
