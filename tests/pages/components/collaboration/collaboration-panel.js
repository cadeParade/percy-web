import {create} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-collaboration-panel]',
};

export const collaborationPanel = {
  scope: SELECTORS.SCOPE,
};

export default create(collaborationPanel);
