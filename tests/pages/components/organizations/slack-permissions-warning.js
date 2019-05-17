import {create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-slack-warning]',
};

export const SlackPermissionsWarning = {
  scope: SELECTORS.CONTAINER,
};

export default create(SlackPermissionsWarning);
