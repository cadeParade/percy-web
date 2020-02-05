import {action} from '@ember/object';
import Route from '@ember/routing/route';

export default class SecurityRoute extends Route {
  @action
  didTransition() {
    this.analytics.track('Security Policy Viewed');
  }
}
