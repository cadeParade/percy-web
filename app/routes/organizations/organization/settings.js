import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  intercom: service(),
  redirects: service(),
  router: service(),

  model() {
    return this.modelFor('organizations.organization');
  },

  setupController(controller, model) {
    controller.set('organization', model);
  },

  actions: {
    didTransition() {
      const organization = this.controller.get('organization');
      this.analytics.track('Settings Viewed', organization);
    },

    organizationUpdated(organization) {
      // If an organization slug changes, reload the entire application
      // to prevent odd bugs, since we rely on the org slug for basically everything.
      const destinationUrl = this.router.urlFor('organization', organization.get('slug'));
      window.location.href = destinationUrl;
    },

    redirectToRecentProjectSettings() {
      this.redirects.redirectToRecentProjectForOrg(this.modelFor(this.routeName), {
        goToSettings: true,
      });
    },
  },
});
