import {create, clickable, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  CONTAINER: '[data-test-tooltip-wrapper]',
  ANCHOR: '[data-test-tooltip-anchor]',
  TOOLTIP: '.ember-attacher',
  DISMISS_BUTTON: '[data-test-tooltip-dismiss-button]',
  DISMISS_ALL_BUTTON: '[data-test-tooltip-dismiss-all-button]',
};

export const DemoTooltip = {
  scope: SELECTORS.CONTAINER,

  isAnchorVisible: isVisible(SELECTORS.ANCHOR),
  clickAnchor: clickable(SELECTORS.ANCHOR),

  clickDismiss: clickable(SELECTORS.DISMISS_BUTTON, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),
  clickDismissAll: clickable(SELECTORS.DISMISS_ALL_BUTTON, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),
};

export default create(DemoTooltip);
