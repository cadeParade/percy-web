import {alias, filter, filterBy, readOnly} from '@ember/object/computed';
import {computed, get, set} from '@ember/object';
import Component from '@ember/component';
import {inject as service} from '@ember/service';
import groupSnapshots from 'percy-web/lib/group-snapshots';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';

export default Component.extend(EKMixin, {
  classNames: ['SnapshotList'],
  attributeBindings: ['data-test-snapshot-list'],
  'data-test-snapshot-list': true,
  store: service(),
  snapshotQuery: service(),
  analytics: service(),

  // Required params
  snapshotsChanged: null,
  build: null,
  isKeyboardNavEnabled: null,
  showSnapshotFullModalTriggered: null,
  createReview: null,
  allDiffsShown: null,
  toggleAllDiffs: null,
  isUnchangedSnapshotsVisible: null,
  isUnchangedSnapshotsLoading: false,
  snapshotsUnchanged: null,

  // Set internally by actions
  activeSnapshotBlockId: null,

  shouldDeferRendering: computed('snapshotBlocks.length', 'snapshotsUnchanged.length', function() {
    return this.snapshotBlocks.length + this.snapshotsUnchanged.length > 75;
  }),

  _singleSnapshotsChanged: readOnly('_snapshotGroups.singles'),
  _unapprovedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isUnreviewed', true),
  _unapprovedSingleSnapshotsWithComments: filterBy(
    '_unapprovedSingleSnapshots',
    'hasOpenCommentThreads',
    true,
  ),
  _unapprovedSingleSnapshotsWithoutComments: filterBy(
    '_unapprovedSingleSnapshots',
    'hasOpenCommentThreads',
    false,
  ),

  _approvedSingleSnapshotsWithComments: filterBy(
    '_approvedSingleSnapshots',
    'hasOpenCommentThreads',
    true,
  ),

  _approvedSingleSnapshotsWithoutComments: filterBy(
    '_approvedSingleSnapshots',
    'hasOpenCommentThreads',
    false,
  ),

  _rejectedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isRejected', true),

  _approvedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isApproved', true),

  _groupedSnapshotsChanged: readOnly('_snapshotGroups.groups'),

  numSnapshotsUnchanged: computed('build.totalSnapshots', 'snapshotsChanged.length', function() {
    return this.build.totalSnapshots - this.snapshotsChanged.length;
  }),

  _snapshotGroups: computed('snapshotsChanged.@each.fingerprint', function() {
    return groupSnapshots(this.snapshotsChanged);
  }),

  _rejectedGroups: computed('_groupedSnapshotsChanged.[]', function() {
    return this._groupedSnapshotsChanged.filter(group => {
      return group.any(snapshot => snapshot.isRejected);
    });
  }),

  _unapprovedGroups: computed('_groupedSnapshotsChanged.[]', function() {
    return this._groupedSnapshotsChanged.filter(group => {
      const areAllApproved = group.every(snapshot => snapshot.isApproved);
      const areAnyRejected = group.any(snapshot => snapshot.isRejected);
      return !areAllApproved && !areAnyRejected;
    });
  }),

  _unapprovedGroupsWithComments: filter('_unapprovedGroups', findGroupWithComments),
  _unapprovedGroupsWithoutComments: filter('_unapprovedGroups', rejectGroupWithComments),

  _approvedGroupsWithComments: filter('_approvedGroups', findGroupWithComments),
  _approvedGroupsWithoutComments: filter('_approvedGroups', rejectGroupWithComments),

  _approvedGroups: computed('_groupedSnapshotsChanged.[]', function() {
    return this._groupedSnapshotsChanged.filter(group => {
      return group.every(snapshot => snapshot.isApproved);
    });
  }),

  // These can be single snapshots or grouped snapshots.
  // This computed property purposely does not depend on all the things it contains because we don't
  // want snapshots to change order until the page is refreshed.
  // Unless the browser changes, then we want it to be in the new order for the browser.
  snapshotBlocks: computed('activeBrowser', function() {
    return this._rejectedGroups.concat(
      this._rejectedSingleSnapshots,
      this._unapprovedGroupsWithComments,
      this._unapprovedSingleSnapshotsWithComments,
      this._unapprovedGroupsWithoutComments,
      this._unapprovedSingleSnapshotsWithoutComments,
      this._approvedGroupsWithComments,
      this._approvedSingleSnapshotsWithComments,
      this._approvedGroupsWithoutComments,
      this._approvedSingleSnapshotsWithoutComments,
    );
  }),

  actions: {
    updateActiveSnapshotBlockId(newSnapshotBlockId) {
      set(this, 'activeSnapshotBlockId', newSnapshotBlockId);
    },
  },

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
    this.unchangedSnapshots = this.unchangedSnapshots || [];
  },

  onDKeyPress: on(keyDown('KeyD'), function() {
    if (this.isKeyboardNavEnabled) {
      this.toggleAllDiffs({trackSource: 'keypress'});
      this._trackKeyPress();
    }
  }),

  onUpKeyPress: on(keyDown('ArrowUp'), function() {
    if (this.isKeyboardNavEnabled) {
      set(this, 'activeSnapshotBlockId', this._calculateNewActiveSnapshotBlockId({isNext: false}));
      this._trackKeyPress();
    }
  }),

  onDownKeyPress: on(keyDown('ArrowDown'), function() {
    if (this.isKeyboardNavEnabled) {
      set(this, 'activeSnapshotBlockId', this._calculateNewActiveSnapshotBlockId({isNext: true}));
      this._trackKeyPress();
    }
  }),

  _trackKeyPress() {
    this.analytics.track('Snapshot List Navigated', get(this, 'build.project.organization'), {
      type: 'keyboard',
      project_id: get(this, 'build.project.id'),
      build_id: get(this, 'build.id'),
    });
  },

  _allVisibleSnapshotBlocks: computed(
    'snapshotBlocks.[]',
    'snapshotsUnchanged.[]',
    'isUnchangedSnapshotsVisible',
    function() {
      if (this.isUnchangedSnapshotsVisible) {
        return [].concat(this.snapshotBlocks, this.snapshotsUnchanged);
      } else {
        return this.snapshotBlocks;
      }
    },
  ),

  _snapshotBlockIds: computed('_allVisibleSnapshotBlocks.@each.id', function() {
    return this._allVisibleSnapshotBlocks.map(block => {
      return block.id || block.firstObject.fingerprint;
    });
  }),
  _numSnapshotBlocks: alias('_allVisibleSnapshotBlocks.length'),
  _calculateNewActiveSnapshotBlockId({isNext = true} = {}) {
    let currentIndex = this._snapshotBlockIds.indexOf(this.activeSnapshotBlockId);

    // if we are moving forward and are on the last snapshot, wrap to beginning of list
    if (isNext && currentIndex === this._numSnapshotBlocks - 1) {
      currentIndex = -1;
    } else if (!isNext && currentIndex === 0) {
      // if we are moving backward and are on the first snapshot, wrap to end of list
      currentIndex = this._numSnapshotBlocks;
    }

    const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
    return this._snapshotBlockIds[newIndex];
  },
});

function findGroupWithComments(group) {
  return group.any(snapshot => snapshot.hasOpenCommentThreads);
}

function rejectGroupWithComments(group) {
  return !findGroupWithComments(group);
}
