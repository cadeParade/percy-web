import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class SettingsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  intercom;

  @service
  redirects;

  @service
  router;

  @service
  session;

  model() {
    return this.modelFor('organizations.organization');
  }

  setupController(controller, model) {
    controller.setProperties({
      organization: model,
      currentUser: this.session.currentUser,
    });
  }

  @action
  didTransition() {
    const organization = this.controller.get('organization');
    this.analytics.track('Settings Viewed', organization);
  }

  @action
  organizationUpdated(organization) {
    // If an organization slug changes, reload the entire application
    // to prevent odd bugs, since we rely on the org slug for basically everything.
    const destinationUrl = this.router.urlFor('organization', organization.get('slug'));
    window.location.href = destinationUrl;
  }

  @action
  redirectToRecentProjectSettings() {
    this.redirects.redirectToRecentProjectForOrg(this.modelFor(this.routeName), {
      goToSettings: true,
    });
  }
}
