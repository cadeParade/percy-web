import {text, create, collection, hasClass, isPresent} from 'ember-cli-page-object';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  BROWSER_SWITCHER: '[data-test-browser-switcher]',
  BUTTON: '[data-test-browser-switcher-button]',
  DIFF_COUNT: '[data-test-browser-switcher-diff-count]',
  APPROVED_CHECK: '[data-test-browser-switcher-diff-count-all-approved]',
};

export const BrowserSwitcher = {
  scope: SELECTORS.BROWSER_SWITCHER,

  buttons: collection(SELECTORS.BUTTON, {
    isActive: hasClass('is-browser-active'),
    diffCount: text(SELECTORS.DIFF_COUNT),
    isDiffCountPresent: isPresent(SELECTORS.DIFF_COUNT),
    isAllApproved: isPresent(SELECTORS.APPROVED_CHECK),
    isChrome: hasClass('data-test-browser-switcher-chrome'),
    isFirefox: hasClass('data-test-browser-switcher-firefox'),
  }),

  chromeButton: getter(function() {
    return this.buttons.toArray().findBy('isChrome');
  }),

  firefoxButton: getter(function() {
    return this.buttons.toArray().findBy('isFirefox');
  }),

  switchBrowser() {
    const activeBrowser = this.buttons.toArray().findBy('isActive');
    if (activeBrowser.isChrome) {
      return this.firefoxButton.click();
    } else {
      return this.chromeButton.click();
    }
  },
};

export default create(BrowserSwitcher);
