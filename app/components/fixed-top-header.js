import {inject as service} from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  session: service(),
  redirects: service(),
  currentOrganization: null,
  shouldDisplayDashboardLink: false,

  actions: {
    handleDashboardClick() {
      const currentOrganization = this.get('currentOrganization');
      this.get('redirects').redirectToRecentProjectForOrg(currentOrganization);
    },
  },
});
