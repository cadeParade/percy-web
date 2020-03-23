import {collection, create, hasClass, property, visitable} from 'ember-cli-page-object';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SCOPE: '[data-test-user-notification-setting-form]',
  NOTIF_OPTION: '[data-test-notif-option]',
  OPTION_LABEL: '[data-test-notif-option-label]',
  OPTION_DESCRIPTION: '[data-test-notif-option-description]',
  OPTION_CHECKBOX: '[data-test-checkbox]',
  SUBMIT_BUTTON: '[data-test-percy-btn-label=submit]',
};

export const userNotificationSettingForm = {
  scope: SELECTORS.SCOPE,
  visitUserNotificationSettingsPage: visitable('/settings/notifications'),

  options: collection(SELECTORS.NOTIF_OPTION, {
    label: {scope: SELECTORS.OPTION_LABEL},
    description: {scope: SELECTORS.OPTION_DESCRIPTION},
    isChecked: property('checked', SELECTORS.OPTION_CHECKBOX),
    checkbox: {scope: SELECTORS.OPTION_CHECKBOX},
  }),

  commentEmailReply: getter(function () {
    return this.options.toArray().findBy('label.text', 'Snapshot email notifications');
  }),

  commentEmailMention: getter(function () {
    return this.options.toArray().findBy('label.text', 'Mention email notifications');
  }),

  submit: {
    scope: SELECTORS.SUBMIT_BUTTON,
    isSaving: hasClass('is-loading'),
  },
};

export default create(userNotificationSettingForm);
