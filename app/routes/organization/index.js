import Route from '@ember/routing/route';
import isUserMemberPromise from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';

export default Route.extend({
  redirects: service(),
  projectQuery: service(),

  model() {
    const organization = this.modelFor('organization');
    const projects = this.projectQuery.getAllProjects(organization);
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
    const enabledProjects = model.projects.filterBy('isEnabled', true);
    const archivedProjects = model.projects.filterBy('isDisabled', true);

    controller.setProperties({
      enabledProjects,
      archivedProjects,
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
