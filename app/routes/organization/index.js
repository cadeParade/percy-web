import Route from '@ember/routing/route';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';

export default Route.extend({
  redirects: service(),
  projectQuery: service(),
  session: service(),

  model() {
    const organization = this.modelFor('organization');
    const projects = this.projectQuery.getAllProjects(organization);
    const isMember = isUserMember(this.session.currentUser, organization);
    return hash({
      organization,
      projects,
      isUserMember: isMember,
    });
  },

  redirect(model) {
    if (model.projects.length < 1) {
      this.redirects.redirectToRecentProjectForOrg(model.organization);
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
