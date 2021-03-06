import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import ExtendedInfinityModel from 'percy-web/lib/paginated-ember-infinity-model';
import {hash} from 'rsvp';
import {INFINITY_SCROLL_LIMIT} from 'percy-web/models/build';

export default class IndexRoute extends Route {
  @service
  infinity;

  @service
  session;
  model() {
    const project = this.modelFor('organization.project');
    const organization = this.modelFor('organization');
    const isUserMemberOfOrg = isUserMember(this.session.currentUser, organization);

    return hash({
      organization,
      project,
      isUserMember: isUserMemberOfOrg,
    });
  }

  afterModel(model) {
    this.fetchBuilds(model.project);
  }

  async fetchBuilds(project) {
    const controller = this.controllerFor(this.routeName);
    controller.set('isLoading', true);
    const infinityBuilds = await this._buildQuery(project);
    controller.set('isLoading', false);
    controller.setProperties({infinityBuilds});
  }

  setupController(controller, model) {
    controller.setProperties({
      project: model.project,
      isUserMember: model.isUserMember,
    });
  }

  @action
  didTransition() {
    let project = this.modelFor(this.routeName).project;
    let organization = project.get('organization');
    let eventProperties = {
      project_id: project.get('id'),
      project_slug: project.get('slug'),
    };
    this.analytics.track('Project Viewed', organization, eventProperties);
  }

  _buildQuery(project) {
    return this.infinity.model(
      'build',
      {
        project: project,
        perPage: INFINITY_SCROLL_LIMIT,
        perPageParam: 'page[limit]',
        pageParam: null,
        countParam: 'cursor',
      },
      ExtendedInfinityModel,
    );
  }
}
