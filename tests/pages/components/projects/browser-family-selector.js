import {create, collection, hasClass} from 'ember-cli-page-object';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  BROWSER_FAMILY_SELECTOR: '[data-test-browser-family-selector]',
  BUTTON: '[data-test-browser-selector-button]',
};

export const BrowserFamilySelector = {
  scope: SELECTORS.BROWSER_FAMILY_SELECTOR,

  buttons: collection(SELECTORS.BUTTON, {
    isActive: hasClass('is-browser-active'),
    isChrome: hasClass('data-test-browser-selector-chrome'),
    isFirefox: hasClass('data-test-browser-selector-firefox'),
    isDisabled: hasClass('opacity-50'),
  }),

  chromeButton: getter(function() {
    return this.buttons.toArray().findBy('isChrome');
  }),

  firefoxButton: getter(function() {
    return this.buttons.toArray().findBy('isFirefox');
  }),

  clickChrome() {
    this.chromeButton.click();
  },

  clickFirefox() {
    this.firefoxButton.click();
  },
};

export default create(BrowserFamilySelector);
