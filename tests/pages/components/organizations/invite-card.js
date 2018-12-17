import {create, is, property, text} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-invite-card]',
  AVATAR: '[data-test-invite-avatar]',
  CANCEL_BUTTON: '[data-test-invite-button-toolbar] [data-test-percy-btn]',
  COPY_URL_BUTTON: '[data-test-invite-copy-url-button]',
  EMAIL: '[data-test-invite-email]',
  EXPIRATION: '[data-test-invite-expiration]',
  INVITE_DATE: '[data-test-invite-date]',
  INVITER_NAME: '[data-test-invite-inviter-name]',
  ROLE: '[data-test-invite-role]',
};

export const InviteCard = {
  scope: SELECTORS.CONTAINER,

  avatarUrl: property('src', 'img', {scope: SELECTORS.AVATAR}),
  cancelButton: {
    scope: SELECTORS.CANCEL_BUTTON,
    isDisabled: is(':disabled'),
  },
  copyUrlButton: {
    scope: SELECTORS.COPY_URL_BUTTON,
    isDisabled: is(':disabled'),
  },
  email: text(SELECTORS.EMAIL),
  inviteDate: text(SELECTORS.INVITE_DATE),
  inviteExpiration: text(SELECTORS.EXPIRATION),
  inviterName: text(SELECTORS.INVITER_NAME),
  role: text(SELECTORS.ROLE),
};

export default create(InviteCard);
