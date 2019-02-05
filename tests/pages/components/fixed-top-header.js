import {clickable, create} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-fixed-top-header]',
  ORG_SETTINGS_LINK: '[data-test-settings-link]',
};

export const FixedTopHeader = {
  scope: SELECTORS.SCOPE,
  clickOrgSettingsLink: clickable(SELECTORS.ORG_SETTINGS_LINK),
};

export default create(FixedTopHeader);
