import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {SNAPSHOT_COMPARISON_INCLUDES} from 'percy-web/services/snapshot-query';

export default Route.extend({
  snapshotQuery: service(),
  store: service(),
  flashMessages: service(),
  session: service(),
  params: null,

  model(params /*transition*/) {
    this.set('params', params);
    const organization = this.modelFor('organization');
    const snapshot = this.store.loadRecord('snapshot', params.snapshot_id, {
      include: SNAPSHOT_COMPARISON_INCLUDES.join(','),
      backgroundReload: false,
    });
    return hash({
      snapshot,
      isUserMember: isUserMember(this.session.currentUser, organization),
    });
  },

  setupController(controller, model) {
    const params = this.params;
    const build = this.modelFor('organization.project.builds.build2').build;

    controller.setProperties({
      build,
      snapshot: model.snapshot,
      isBuildApprovable: model.isUserMember,
      snapshotId: params.snapshot_id,
    });
  },

  actions: {
    willTransition(transition) {
      this.controllerFor('organization.project.builds.build2').send(
        'loadNextSnapshots',
        transition.from.params.snapshot_id,
      );
    },
    noop() {},
  },
});
