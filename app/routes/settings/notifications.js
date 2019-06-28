import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  currentUser: alias('session.currentUser'),

  model() {
    const user = this.session.currentUser;
    const setting = user.userNotificationSetting;
    if (setting) {
      return setting;
    } else {
      return this.store.createRecord('user-notification-setting', {user});
    }
  },
});
