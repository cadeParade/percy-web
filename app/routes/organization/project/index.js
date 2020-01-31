import Route from '@ember/routing/route';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import ExtendedInfinityModel from 'percy-web/lib/paginated-ember-infinity-model';
import {inject as service} from '@ember/service';
import {hash} from 'rsvp';

import {INFINITY_SCROLL_LIMIT} from 'percy-web/models/build';

export default Route.extend({
  infinity: service(),
  session: service(),

  model() {
    const project = this.modelFor('organization.project');
    const organization = this.modelFor('organization');
    const projects = this.store.query('project', {organization: organization});
    const infinityBuilds = this.infinity.model(
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
    const isUserMemberOfOrg = isUserMember(this.session.currentUser, organization);

    return hash({
      organization,
      project,
      projects,
      infinityBuilds,
      isUserMemberOfOrg,
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      project: model.project,
      projects: model.projects,
      infinityBuilds: model.infinityBuilds,
      isUserMember: model.isUserMemberOfOrg,
    });
  },

  actions: {
    didTransition() {
      this._super.apply(this, arguments);

      let project = this.modelFor(this.routeName).project;
      let organization = project.get('organization');
      let eventProperties = {
        project_id: project.get('id'),
        project_slug: project.get('slug'),
      };
      this.analytics.track('Project Viewed', organization, eventProperties);
    },
  },
});
