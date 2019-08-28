import Route from '@ember/routing/route';
import ResetScrollMixin from 'percy-web/mixins/reset-scroll';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import ExtendedInfinityModel from 'percy-web/lib/paginated-ember-infinity-model';
import {inject as service} from '@ember/service';
import {next} from '@ember/runloop';
import {hash} from 'rsvp';

import {INFINITY_SCROLL_LIMIT} from 'percy-web/models/build';

export default Route.extend(ResetScrollMixin, {
  infinity: service(),
  session: service(),

  hasNoBuilds: null,

  queryParams: {
    noBuilds: {
      refreshModel: false,
    },
  },

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

  afterModel(model) {
    if (model.infinityBuilds.length < 1) {
      this.set('hasNoBuilds', 'true');
    }
  },

  actions: {
    willTransition() {
      // reset the noBuilds query param to remove from url
      this.set('hasNoBuilds', null);
      this.controller.set('noBuilds', null);
    },

    didTransition() {
      this._super.apply(this, arguments);

      // show the query param regardless of how the route was navigated to
      this.controller.set('noBuilds', this.hasNoBuilds);

      if (window.Intercom && this.hasNoBuilds) {
        // Wait a tick for the window's location to be updated with noBuilds=true param
        // then update Intercom with the new location so we can show pop-ups for no builds.
        next(() => {
          window.Intercom('update');
        });
      }

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
