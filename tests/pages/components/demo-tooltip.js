import {create, clickable, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  CONTAINER: '[data-test-tooltip-wrapper]',
  NEXTABLE_CONTAINER: '.data-test-nextable-tooltip-wrapper',
  ANCHOR: '[data-test-tooltip-anchor]',
  TOOLTIP: '.ember-attacher',
  NEXT_BUTTON: '[data-test-tooltip-next-button]',
  DISMISS_ALL_BUTTON: '[data-test-tooltip-dismiss-all-button]',
};

export const DemoTooltip = {
  wrapperScope: SELECTORS.CONTAINER,
  nextableScope: SELECTORS.NEXTABLE_CONTAINER,

  isAnchorVisible: isVisible(SELECTORS.ANCHOR),
  clickAnchor: clickable(SELECTORS.ANCHOR),

  clickNext: clickable(SELECTORS.NEXT_BUTTON, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),
  clickDismissAll: clickable(SELECTORS.DISMISS_ALL_BUTTON, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),
};

export default create(DemoTooltip);
