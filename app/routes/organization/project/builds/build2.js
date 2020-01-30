import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {defaultComparisonQueryParams} from 'percy-web/routes/organization/project/builds/default-comparison';
import {on} from '@ember/object/evented';
import {EKMixin, keyDown} from 'ember-keyboard';

export default Route.extend(EKMixin, {
  snapshotQuery: service(),
  session: service(),
  launchDarkly: service(),
  keyboardActivated: true,

  model(params) {
    const org = this.modelFor('organization');
    return hash({
      // Note: passing {reload: true} here to ensure a full reload including all sideloaded data.
      build: this.store.findRecord('build', params.build_id, {reload: true}),
      isUserMember: isUserMember(this.session.currentUser, org),
      snapshots: this.snapshotQuery.getChangedSnapshots(params.build_id),
    });
  },

  afterModel(model) {
    const firstSnapshot = model.snapshots.firstObject;
    this.transitionTo('organization.project.builds.build2.snapshot', firstSnapshot.id, {
      queryParams: defaultComparisonQueryParams(firstSnapshot),
    });
  },

  actions: {
    noop() {},
  },

  //TODO refactor this
  _findActiveSnapshotIndex(snapshots) {
    const activeSnapshotId = this._router.currentRoute.params.snapshot_id;
    return snapshots.mapBy('id').indexOf(activeSnapshotId);
  },

  onUpArrowPress: on(keyDown('ArrowUp'), function(event) {
    console.log('UP');

    if (this._router.currentRoute.name === 'organization.project.builds.build2.snapshot') {
      event.preventDefault();
      const snapshots = this.modelFor(this.routeName).snapshots;
      const activeSnapshotIndex = this._findActiveSnapshotIndex(snapshots);
      const prevSnapshotIndex = activeSnapshotIndex - 1;
      const isTherePrevIndex = prevSnapshotIndex > -1;
      if (activeSnapshotIndex > -1 && isTherePrevIndex) {
        const snapshotAtPrevIndex = snapshots.toArray()[activeSnapshotIndex - 1];
        this.transitionTo('organization.project.builds.build2.snapshot', snapshotAtPrevIndex.id);
      }
    }
  }),

  onDownArrowPress: on(keyDown('ArrowDown'), function(event) {
    console.log("DOWN")
    if (this._router.currentRoute.name === 'organization.project.builds.build2.snapshot') {
      event.preventDefault();
      const snapshots = this.modelFor(this.routeName).snapshots;
      const activeSnapshotIndex = this._findActiveSnapshotIndex(snapshots);
      const nextSnapshotIndex = activeSnapshotIndex + 1;
      const isThereNextIndex = nextSnapshotIndex < snapshots.length;
      if (activeSnapshotIndex > -1 && isThereNextIndex) {
        const snapshotAtNextIndex = snapshots.toArray()[activeSnapshotIndex + 1];
        this.transitionTo('organization.project.builds.build2.snapshot', snapshotAtNextIndex.id);
      }
    }
  }),
});
