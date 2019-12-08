import Component from '@ember/component';
import {task} from 'ember-concurrency';

export const USER_WEB_THEME_OPTIONS = [
  {
    label: 'Light',
    value: 'light',
  },
  {
    label: 'Dark',
    value: 'dark',
  },
  {
    label: 'System',
    value: 'system',
  },
];

export default Component.extend({
  webThemeOptions: USER_WEB_THEME_OPTIONS,

  saveDisplayPreferences: task(function*(theme) {
    try {
      this.user.set('webTheme', theme);
      yield this.user.save();
      this.flashMessages.success('Build review appearance saved.');
    } catch (e) {
      this.flashMessages.danger('Something went wrong. Please try again.');
    }
  }),
});
