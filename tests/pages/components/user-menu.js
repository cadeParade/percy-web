import {clickable, create, collection} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-user-menu]',
  MENU_TOGGLE: '[data-test-org-switcher-toggle]',
  CREATE_ORG: '[data-test-new-org]',
  ORG_ITEM: '[data-test-org-switcher-item]',
  ORG_LINK: '[data-test-switcher-item-link]',
  ORG_SETTINGS_LINK: '[data-test-settings-link]',
  LOGOUT: '[data-test-logout]',
};

export const userMenu = {
  scope: SELECTORS.SCOPE,

  toggleUserMenu: clickable(SELECTORS.MENU_TOGGLE),
  createNewOrg: clickable(SELECTORS.CREATE_ORG),

  orgLinks: collection({
    itemScope: SELECTORS.ORG_ITEM,
    item: {
      clickLink: clickable(SELECTORS.ORG_LINK),
      clickSettings: clickable(SELECTORS.ORG_SETTINGS_LINK),
    },
  }),

  logout: clickable(SELECTORS.LOGOUT),
};

export default create(userMenu);
