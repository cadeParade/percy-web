import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default class MostRecentOrgRoute extends Route {
  @service
  redirects;

  beforeModel() {
    return this.redirects.redirectToDefaultOrganization();
  }
}
