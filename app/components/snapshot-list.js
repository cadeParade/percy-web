import $ from 'jquery';
import {alias, filterBy, gt, mapBy, readOnly} from '@ember/object/computed';
import {computed, get} from '@ember/object';
import Component from '@ember/component';
import {inject as service} from '@ember/service';
import groupSnapshots from 'percy-web/lib/group-snapshots';

const KEYS = {
  DOWN_ARROW: 40,
  UP_ARROW: 38,
  D: 68,
};

export default Component.extend({
  classNames: ['SnapshotList'],
  attributeBindings: ['data-test-snapshot-list'],
  'data-test-snapshot-list': true,
  store: service(),
  snapshotQuery: service(),

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
  activeSnapshotId: null,

  shouldDeferRendering: gt('snapshotsChanged.length', 75),

  _singleSnapshotsChanged: readOnly('_snapshotGroups.singles'),
  _unapprovedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isApproved', false),
  _approvedSingleSnapshots: filterBy('_singleSnapshotsChanged', 'isApproved', true),

  _groupedSnapshotsChanged: readOnly('_snapshotGroups.groups'),

  numSnapshotsUnchanged: computed('build.totalSnapshots', 'snapshotsChanged.length', function() {
    return this.get('build.totalSnapshots') - this.get('snapshotsChanged.length');
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
    updateActiveSnapshotId(newSnapshotId) {
      this.set('activeSnapshotId', newSnapshotId);
    },
  },

  didInsertElement() {
    $(document).bind(
      'keydown.snapshots',
      function(e) {
        if (this.get('isKeyboardNavEnabled')) {
          if (e.keyCode === KEYS.DOWN_ARROW) {
            this.set('activeSnapshotId', this._calculateNewActiveSnapshotId({isNext: true}));
          } else if (e.keyCode === KEYS.UP_ARROW) {
            this.set('activeSnapshotId', this._calculateNewActiveSnapshotId({isNext: false}));
          } else if (e.keyCode === KEYS.D) {
            e.preventDefault();
            this.get('toggleAllDiffs')({trackSource: 'keypress'});
          }
        }
      }.bind(this),
    );
  },
  willDestroyElement() {
    $(document).unbind('keydown.snapshots');
  },

  _allVisibleSnapshots: computed(
    'snapshotsChanged.[]',
    'snapshotsUnchanged.[]',
    'isUnchangedSnapshotsVisible',
    function() {
      if (this.get('isUnchangedSnapshotsVisible')) {
        return [].concat(this.get('snapshotsChanged'), this.get('snapshotsUnchanged'));
      } else {
        return this.get('snapshotsChanged');
      }
    },
  ),

  _snapshotIds: mapBy('_allVisibleSnapshots', 'id'),
  _numSnapshots: alias('_allVisibleSnapshots.length'),
  _calculateNewActiveSnapshotId({isNext = true} = {}) {
    let currentIndex = this.get('_snapshotIds').indexOf(this.get('activeSnapshotId'));

    // if we are moving forward and are on the last snapshot, wrap to beginning of list
    if (isNext && currentIndex === this.get('_numSnapshots') - 1) {
      currentIndex = -1;
    } else if (!isNext && currentIndex === 0) {
      // if we are moving backward and are on the first snapshot, wrap to end of list
      currentIndex = this.get('_numSnapshots');
    }

    const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
    return this.get('_snapshotIds')[newIndex];
  },
});
