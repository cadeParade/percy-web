import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default class UnauthenticatedBaseRoute extends Route {
  @service
  redirects;

  @service
  session;

  beforeModel() {
    if (this.session.isAuthenticated) {
      return this.redirects.redirectToDefaultOrganization();
    } else {
      return super.beforeModel(...arguments);
    }
  }
}
