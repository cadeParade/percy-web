import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class NotificationsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @alias('session.currentUser')
  currentUser;

  model() {
    const user = this.session.currentUser;
    const setting = user.userNotificationSetting;
    if (setting) {
      return setting;
    } else {
      return this.store.createRecord('user-notification-setting', {user});
    }
  }
}
