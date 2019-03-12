import Route from '@ember/routing/route';
import isUserMemberPromise from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';

export default Route.extend({
  redirects: service(),

  model() {
    const organization = this.modelFor('organization');
    const projects = this.store.query('project', {organization: organization});
    const isUserMember = isUserMemberPromise(organization);

    return hash({
      organization,
      projects,
      isUserMember,
    });
  },

  redirect(model) {
    if (model.projects.length < 1) {
      this.get('redirects').redirectToRecentProjectForOrg(model.organization);
    }
  },

  setupController(controller, model) {
    controller.setProperties({
      projects: model.projects,
      organization: model.organization,
      isUserMember: model.isUserMember,
    });
  },

  actions: {
    didTransition() {
      const organization = this.controller.get('organization');
      this.analytics.track('Dashboard Viewed', organization);
    },
  },
});
