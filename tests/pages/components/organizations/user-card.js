import {attribute, collection, create, property, text} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-user-card]',
  AVATAR: '[data-test-user-avatar]',
  BUTTON_TOOLBAR: '[data-test-user-button-toolbar]',
  IDENTITY_ICONS: '[data-test-user-identity-icon]',
  JOIN_DATE: '[data-test-user-join-date]',
  NAME: '[data-test-user-name]',
  PERCY_BTN: '[data-test-percy-btn]',
  ROLE: '[data-test-user-role]',
};

export const UserCard = {
  scope: SELECTORS.CONTAINER,

  avatarUrl: property('src', 'img', {scope: SELECTORS.AVATAR}),
  buttons: collection(SELECTORS.PERCY_BTN),
  identityIcons: collection(SELECTORS.IDENTITY_ICONS, {
    ariaLabel: attribute('aria-label'),
  }),
  joinDate: {scope: SELECTORS.JOIN_DATE},
  role: text(SELECTORS.ROLE),
  userName: {scope: SELECTORS.NAME},
};

export default create(UserCard);
