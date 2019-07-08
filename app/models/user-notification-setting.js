import DS from 'ember-data';
import {computed} from '@ember/object';

export const USER_NOTIFICATION_SETTING_OPTIONS = [
  {
    label: 'Snapshot email notifications',
    value: 'comment_created_email',
    path: 'isCommentCreatedEmailOn',
    description: "Receive an email notification when someone adds a comment to a snapshot you have an open comment on.", // eslint-disable-line
  },
  {
    label: 'Mention email notifications',
    value: 'comment_mention_created_email',
    path: 'isCommentMentionCreatedEmailOn',
    description: 'Receive an email notification when someone @mentions you in a comment.',
  },
];

export default DS.Model.extend({
  user: DS.belongsTo('user', {async: false}),
  notificationTypes: DS.attr({
    defaultValue() {
      return USER_NOTIFICATION_SETTING_OPTIONS.mapBy('value');
    },
  }),

  isCommentCreatedEmailOn: twoWayArrayToggle('comment_created_email'),
  isCommentMentionCreatedEmailOn: twoWayArrayToggle('comment_mention_created_email'),
});

// allows us to get and add/subtract an item in an array.
function twoWayArrayToggle(settingName) {
  return computed('notificationTypes', {
    get(/*key*/) {
      return this.notificationTypes.includes(settingName);
    },
    set(key, shouldBePresent) {
      if (shouldBePresent) {
        // `addObject` only adds if the item is not already present in the array.
        this.notificationTypes.addObject(settingName);
      } else {
        this.notificationTypes.removeObject(settingName);
      }
      return shouldBePresent;
    },
  });
}
