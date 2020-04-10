import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import {hash} from 'rsvp';
import isUserMember from 'percy-web/lib/is-user-member-of-org';

export default class IndexRoute extends Route {
  @service
  redirects;

  @service
  projectQuery;

  @service
  session;

  model() {
    const organization = this.modelFor('organization');
    const isMember = isUserMember(this.session.currentUser, organization);
    return hash({
      organization,
      isUserMember: isMember,
    });
  }

  afterModel(model) {
    this.fetchProjects(model.organization);
  }

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      isUserMember: model.isUserMember,
    });
  }

  async fetchProjects(organization) {
    const controller = this.controllerFor(this.routeName);
    controller.set('isLoading', true);
    const projects = await this.projectQuery.getAllProjects(organization);

    if (projects.length < 1) {
      this.redirects.redirectToRecentProjectForOrg(organization);
    } else {
      const enabledProjects = projects.filterBy('isEnabled', true);
      const archivedProjects = projects.filterBy('isDisabled', true);
      controller.setProperties({
        enabledProjects,
        archivedProjects,
      });
      controller.set('isLoading', false);
    }
  }

  @action
  didTransition() {
    const organization = this.controller.get('organization');
    this.analytics.track('Dashboard Viewed', organization);
  }
}
