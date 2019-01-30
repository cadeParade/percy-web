import Route from '@ember/routing/route';
import localStorageProxy from 'percy-web/lib/localstorage';
import {inject as service} from '@ember/service';

export default Route.extend({
  redirects: service(),

  redirect() {
    return this.get('redirects').redirectToDefaultOrganization();
  },
  afterModel(model) {
    return model
      .get('projects')
      .reload()
      .then(projects => {
        let organizationSlug = model.get('slug');
        let recentProjectSlugs = localStorageProxy.get('recentProjectSlugs') || {};
        let recentProjectSlug = recentProjectSlugs[organizationSlug];
        if (recentProjectSlug && projects.findBy('slug', recentProjectSlug)) {
          this.transitionTo('organization.project.index', organizationSlug, recentProjectSlug);
        } else if (projects.get('length')) {
          let project = projects.sortBy('isDisabled', 'name').get('firstObject');
          let projectSlug = project.get('slug');
          this.transitionTo('organization.project.index', organizationSlug, projectSlug);
        } else {
          this.transitionTo('organizations.organization.projects.new', organizationSlug);
        }
      });
  },
  actions: {
    didTransition() {
      this._super.apply(this, arguments);

      let organization = this.modelFor(this.routeName);
      this.analytics.track('Dashboard Viewed', organization);
    },
  },
});
