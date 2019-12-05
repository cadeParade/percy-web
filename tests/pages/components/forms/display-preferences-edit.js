import {clickable, create} from 'ember-cli-page-object';

const SELECTORS = {
  WEB_THEME_SYSTEM_OPTION: '[data-test-web-theme-option=system]',
  WEB_THEME_LIGHT_OPTION: '[data-test-web-theme-option=light]',
  WEB_THEME_DARK_OPTION: '[data-test-web-theme-option=dark]',
};

export const DisplayPreferencesEdit = {
  selectSystemWebTheme: clickable(SELECTORS.WEB_THEME_SYSTEM_OPTION),
  selectLightWebTheme: clickable(SELECTORS.WEB_THEME_LIGHT_OPTION),
  selectDarkWebTheme: clickable(SELECTORS.WEB_THEME_DARK_OPTION),
};

export default create(DisplayPreferencesEdit);
