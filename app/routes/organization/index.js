import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  redirects: service(),

  redirect() {
    return this.get('redirects').redirectToDefaultOrganization();
  },
  afterModel(model) {
    this.get('redirects').redirectToRecentProjectForOrg(model);
  },
  actions: {
    didTransition() {
      this._super.apply(this, arguments);

      let organization = this.modelFor(this.routeName);
      this.analytics.track('Dashboard Viewed', organization);
    },
  },
});
