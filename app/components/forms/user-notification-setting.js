import Component from '@ember/component';
import {USER_NOTIFICATION_SETTING_OPTIONS} from 'percy-web/models/user-notification-setting';
import {task} from 'ember-concurrency';
import {inject as service} from '@ember/service';

export default Component.extend({
  tagName: '',
  flashMessages: service(),

  userNotificationSetting: null,
  userNotificationSettingOptions: USER_NOTIFICATION_SETTING_OPTIONS,

  _rollbackChanges() {
    this.userNotificationSettingOptions.forEach(option => {
      this.userNotificationSetting.set(option.path, this._origNotifTypes.includes(option.value));
    });
  },

  _isDirty() {
    const orig = this._origNotifTypes;
    const updated = this.userNotificationSetting.notificationTypes;
    return !areStringArraysEqual(orig, updated);
  },

  saveUserNotificationSetting: task(function*() {
    if (!this._isDirty()) return;

    try {
      yield this.userNotificationSetting.save();
      this.set('_origNotifTypes', this.userNotificationSetting.notificationTypes.slice(0));
    } catch (e) {
      this._rollbackChanges();
      this.flashMessages.danger('Something went wrong. Please try again.');
    }
  }),

  init() {
    this._super(...arguments);
    // slice to take a copy of the settings -- no reference to original array.
    const _origNotifTypes = this.userNotificationSetting.notificationTypes.slice(0);
    this.setProperties({_origNotifTypes});
  },
});

function areStringArraysEqual(a1, a2) {
  a1.sort();
  a2.sort();
  return JSON.stringify(a1) === JSON.stringify(a2);
}
