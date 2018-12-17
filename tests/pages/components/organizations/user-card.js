import {collection, create, property, text} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-user-card]',
  AVATAR: '[data-test-user-avatar]',
  BUTTON_TOOLBAR: '[data-test-user-button-toolbar]',
  JOIN_DATE: '[data-test-user-join-date]',
  NAME: '[data-test-user-name]',
  PERCY_BTN: '[data-test-percy-btn]',
  ROLE: '[data-test-user-role]',
};

export const UserCard = {
  scope: SELECTORS.CONTAINER,

  avatarUrl: property('src', 'img', {scope: SELECTORS.AVATAR}),
  buttons: collection({
    scope: SELECTORS.BUTTON_TOOLBAR,
    itemScope: SELECTORS.PERCY_BTN,
  }),
  joinDate: {scope: SELECTORS.JOIN_DATE},
  role: text(SELECTORS.ROLE),
  userName: {scope: SELECTORS.NAME},
};

export default create(UserCard);
