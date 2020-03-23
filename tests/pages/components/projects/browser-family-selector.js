import {
  clickable,
  create,
  collection,
  isVisible,
  hasClass,
  text,
  isPresent,
} from 'ember-cli-page-object';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  BROWSER_FAMILY_SELECTOR: '[data-test-browser-family-selector]',
  BUTTON_CONTAINER: '[data-test-browser-selector-button-container]',
  BUTTON: '[data-test-browser-selector-button]',
  UPGRADE_BUTTON: '[data-test-percy-btn-label=browser-upgrade]',
  UPDATE_PERIOD_FIREFOX: '[data-test-family-update-period="Firefox"]',
  UPDATE_PERIOD_CHROME: '[data-test-family-update-period="Chrome"]',
};

export const BrowserFamilySelector = {
  scope: SELECTORS.BROWSER_FAMILY_SELECTOR,

  buttonContainers: collection(SELECTORS.BUTTON_CONTAINER, {
    isActive: hasClass('is-selected', SELECTORS.BUTTON),
    isChrome: hasClass('data-test-browser-selector-chrome', SELECTORS.BUTTON),
    isFirefox: hasClass('data-test-browser-selector-firefox', SELECTORS.BUTTON),
    isDisabled: hasClass('opacity-50', SELECTORS.BUTTON),
    isUpgradeable: isVisible(SELECTORS.UPGRADE_BUTTON),
    click: clickable(SELECTORS.BUTTON),
    upgradeButton: {
      scope: SELECTORS.UPGRADE_BUTTON,
    },
  }),

  chromeButton: getter(function () {
    return this.buttonContainers.toArray().findBy('isChrome');
  }),

  firefoxButton: getter(function () {
    return this.buttonContainers.toArray().findBy('isFirefox');
  }),

  clickChrome() {
    this.chromeButton.click();
  },

  clickFirefox() {
    this.firefoxButton.click();
  },

  upgradeChrome() {
    this.chromeButton.upgradeButton.click();
  },

  upgradeFirefox() {
    this.firefoxButton.upgradeButton.click();
  },

  firefoxUpdatePeriod: text(SELECTORS.UPDATE_PERIOD_FIREFOX),
  chromeUpdatePeriod: text(SELECTORS.UPDATE_PERIOD_CHROME),

  hasFirefoxUpdatePeriod: isPresent(SELECTORS.UPDATE_PERIOD_FIREFOX),
  hasChromeUpdatePeriod: isPresent(SELECTORS.UPDATE_PERIOD_CHROME),
};

export default create(BrowserFamilySelector);
