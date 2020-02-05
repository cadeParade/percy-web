import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default class RecentProjectRoute extends Route {
  @service
  redirects;

  beforeModel() {
    this.redirects.redirectToRecentLocalstorageProject();
  }
}
