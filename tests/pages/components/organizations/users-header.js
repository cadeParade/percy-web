import {attribute, create, fillable, hasClass, isVisible, text} from 'ember-cli-page-object';

const SELECTORS = {
  CONTAINER: '[data-test-users-header]',
  BILLING_PAGE_LINK: '[data-test-billing-link]',
  CANCEL_BUTTON: '[data-test-cancel-button]',
  FORM_ERROR: '[data-test-invite-permission-error]',
  INVITE_BUTTON: '[data-test-invite-button]',
  INVITE_FORM: '[data-test-invite-form-wrapper]',
  ORGANIZATION_NAME: '[data-test-organization-name]',
  SEAT_COUNT_TEXT: '[data-test-seat-count-text]',
  SEND_INVITES_BUTTON: '[data-test-form-submit-button]',
  SHOW_SUPPORT_LINK: '[data-test-users-show-support]',
  TEXT_AREA: 'textarea',
  TOOLTIP: '[data-test-no-seats-tooltip]',
};

export const UsersHeader = {
  scope: SELECTORS.CONTAINER,

  billingLink: {scope: SELECTORS.BILLING_PAGE_LINK, isVisible: isVisible()},
  cancelButton: {scope: SELECTORS.CANCEL_BUTTON},
  enterEmails: fillable(SELECTORS.TEXT_AREA),
  formError: {scope: SELECTORS.FORM_ERROR},
  inviteButton: {
    scope: SELECTORS.INVITE_BUTTON,
    isDisabled: hasClass('disabled'),
  },
  inviteForm: {scope: SELECTORS.INVITE_FORM},
  inviteButtonTooltip: {
    scope: SELECTORS.TOOLTIP,
    isActive: hasClass('hint--rounded'),
    label: attribute('aria-label'),
  },
  organizationName: text(SELECTORS.ORGANIZATION_NAME),
  seatCount: {scope: SELECTORS.SEAT_COUNT_TEXT},
  sendInvitesButton: {scope: SELECTORS.SEND_INVITES_BUTTON},
  supportLink: {scope: SELECTORS.SHOW_SUPPORT_LINK},
};

export default create(UsersHeader);
