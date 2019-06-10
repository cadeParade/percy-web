import {alias, filterBy, gt, readOnly} from '@ember/object/computed';
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

  shouldDeferRendering: gt('snapshotBlocks.length', 75),

  _singleSnapshotsChanged: readOnly('_snapshotGroups.singles'),
  _unapprovedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isApproved', false),
  _approvedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isApproved', true),

  _groupedSnapshotsChanged: readOnly('_snapshotGroups.groups'),

  numSnapshotsUnchanged: computed('build.totalSnapshots', 'snapshotsChanged.length', function() {
    return get(this, 'build.totalSnapshots') - get(this, 'snapshotsChanged.length');
  }),

  _snapshotGroups: computed('snapshotsChanged.@each.fingerprint', function() {
    return groupSnapshots(get(this, 'snapshotsChanged'));
  }),

  _unapprovedGroups: computed('_groupedSnapshotsChanged.[]', function() {
    return get(this, '_groupedSnapshotsChanged').filter(group => {
      return group.any(snapshot => get(snapshot, 'isUnreviewed'));
    });
  }),

  _approvedGroups: computed('_groupedSnapshotsChanged.[]', function() {
    return get(this, '_groupedSnapshotsChanged').filter(group => {
      return group.every(snapshot => get(snapshot, 'isApproved'));
    });
  }),

  // These can be single snapshots or grouped snapshots.
  // This computed property purposely does not depend on all the things it contains because we don't
  // want snapshots to change order until the page is refreshed.
  // Unless the browser changes, then we want it to be in the new order for the browser.
  snapshotBlocks: computed('activeBrowser', function() {
    return get(this, '_unapprovedGroups').concat(
      get(this, '_unapprovedSingleSnapshots'),
      get(this, '_approvedGroups'),
      get(this, '_approvedSingleSnapshots'),
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
  },

  onDKeyPress: on(keyDown('KeyD'), function() {
    if (this.isKeyboardNavEnabled) {
      get(this, 'toggleAllDiffs')({trackSource: 'keypress'});
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
    this.get('analytics').track('Snapshot List Navigated', this.get('build.project.organization'), {
      type: 'keyboard',
      project_id: this.get('build.project.id'),
      build_id: this.get('build.id'),
    });
  },

  _allVisibleSnapshotBlocks: computed(
    'snapshotBlocks.[]',
    'snapshotsUnchanged.[]',
    'isUnchangedSnapshotsVisible',
    function() {
      if (get(this, 'isUnchangedSnapshotsVisible')) {
        return [].concat(get(this, 'snapshotBlocks'), get(this, 'snapshotsUnchanged'));
      } else {
        return get(this, 'snapshotBlocks');
      }
    },
  ),

  _snapshotBlockIds: computed('_allVisibleSnapshotBlocks.@each.id', function() {
    return get(this, '_allVisibleSnapshotBlocks').map(block => {
      return get(block, 'id') || get(block, 'firstObject.fingerprint');
    });
  }),
  _numSnapshotBlocks: alias('_allVisibleSnapshotBlocks.length'),
  _calculateNewActiveSnapshotBlockId({isNext = true} = {}) {
    let currentIndex = get(this, '_snapshotBlockIds').indexOf(get(this, 'activeSnapshotBlockId'));

    // if we are moving forward and are on the last snapshot, wrap to beginning of list
    if (isNext && currentIndex === get(this, '_numSnapshotBlocks') - 1) {
      currentIndex = -1;
    } else if (!isNext && currentIndex === 0) {
      // if we are moving backward and are on the first snapshot, wrap to end of list
      currentIndex = get(this, '_numSnapshotBlocks');
    }

    const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
    return get(this, '_snapshotBlockIds')[newIndex];
  },
});
