import {create} from 'ember-cli-page-object';
import {focus} from '@ember/test-helpers';
import {keyDown} from 'ember-keyboard/test-support/test-helpers';

const SELECTORS = {
  SCOPE: '[data-test-percy-textarea]',
};

export const percyTextarea = {
  scope: SELECTORS.SCOPE,

  async cmdEnter() {
    await focus(SELECTORS.SCOPE);
    await keyDown('cmd+Enter');
  },
  async escape() {
    await focus(SELECTORS.SCOPE);
    await keyDown('Escape');
  },
};

export default create(percyTextarea);
