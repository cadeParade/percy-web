import {create, isVisible} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-notice-bar]',
  MESSAGE: '[data-test-message]',
  PERCENTAGE: '[data-test-percentage]',
  LINK: '[data-test-link]',
};

export const NoticeBar = {
  scope: SELECTORS.CONTAINER,
  message: {scope: SELECTORS.MESSAGE, isVisible: isVisible()},
  percentage: {scope: SELECTORS.PERCENTAGE, isVisible: isVisible()},
  buttonLink: {scope: SELECTORS.LINK, isVisible: isVisible()},
};

export default create(NoticeBar);
