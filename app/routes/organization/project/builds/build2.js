import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {on} from '@ember/object/evented';
import {EKMixin, keyDown} from 'ember-keyboard';
import {DIFF_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';
import {SNAPSHOT_COMPARISON_INCLUDES} from 'percy-web/services/snapshot-query';

export default Route.extend(EKMixin, {
  snapshotQuery: service(),
  session: service(),
  launchDarkly: service(),
  router: service(),
  keyboardActivated: true,

  model(params) {
    const org = this.modelFor('organization');
    return hash({
      // Note: passing {reload: true} here to ensure a full reload including all sideloaded data.
      build: this.store.findRecord('build', params.build_id, {reload: true}),
      isUserMember: isUserMember(this.session.currentUser, org),
      // snapshots with diffs
      snapshots: this.store.loadRecords('snapshot', {
        filter: {
          build: params.build_id,
          'review-state-reason': DIFF_REVIEW_STATE_REASONS.join(','),
        },
        // currently required for thumbnails but hurts initial load performance
        // include: 'null',
      }),
    });
  },
  setupController(controller, model) {
    controller.setProperties({
      build: model.build,
      isUserMember: model.isUserMember,
      snapshots: model.snapshots,
    });
  },
  afterModel(model) {
    const firstSnapshot = model.snapshots.firstObject;
    this.transitionTo('organization.project.builds.build2.snapshot', firstSnapshot.id);
    this.loadNextSnapshots(firstSnapshot.id);
  },

  loadNextSnapshots(currentSnapshotId) {
    const snapshotIds = this.modelFor(this.routeName).snapshots.mapBy('id');
    const currentIndex = snapshotIds.indexOf(currentSnapshotId);
    const next3Snapshots = snapshotIds.slice(currentIndex + 1, currentIndex + 4);
    next3Snapshots.forEach(snapshotId => {
      this.store.loadRecord('snapshot', snapshotId, {
        include: SNAPSHOT_COMPARISON_INCLUDES.join(','),
        backgroundReload: false,
      });
    });
  },

  actions: {
    loadNextSnapshots(currentSnapshotId) {
      this.loadNextSnapshots(currentSnapshotId);
    },
    noop() {},
    goToNextSnapshot() {
      this.goToNext();
    },
    goToPreviousSnapshot() {
      this.goToPrevious();
    },
  },

  //TODO refactor this
  _findActiveSnapshotIndex(snapshots) {
    const activeSnapshotId = this.router.currentRoute.params.snapshot_id;
    return snapshots.mapBy('id').indexOf(activeSnapshotId);
  },

  goToNext() {
    const snapshots = this.modelFor(this.routeName).snapshots;
    const activeSnapshotIndex = this._findActiveSnapshotIndex(snapshots);
    const nextSnapshotIndex = activeSnapshotIndex + 1;
    const isThereNextIndex = nextSnapshotIndex < snapshots.length;
    if (activeSnapshotIndex > -1 && isThereNextIndex) {
      const snapshotAtNextIndex = snapshots.toArray()[activeSnapshotIndex + 1];
      this.transitionTo('organization.project.builds.build2.snapshot', snapshotAtNextIndex.id);
    }
  },

  goToPrevious() {
    const snapshots = this.modelFor(this.routeName).snapshots;
    const activeSnapshotIndex = this._findActiveSnapshotIndex(snapshots);
    const prevSnapshotIndex = activeSnapshotIndex - 1;
    const isTherePrevIndex = prevSnapshotIndex > -1;
    if (activeSnapshotIndex > -1 && isTherePrevIndex) {
      const snapshotAtPrevIndex = snapshots.toArray()[activeSnapshotIndex - 1];
      this.transitionTo('organization.project.builds.build2.snapshot', snapshotAtPrevIndex.id);
    }
  },

  onUpArrowPress: on(keyDown('ArrowUp'), function(event) {
    if (this.router.currentRoute.name === 'organization.project.builds.build2.snapshot') {
      event.preventDefault();
      this.goToPrevious();
    }
  }),

  onDownArrowPress: on(keyDown('ArrowDown'), function(event) {
    if (this.router.currentRoute.name === 'organization.project.builds.build2.snapshot') {
      event.preventDefault();
      this.goToNext();
    }
  }),
});
