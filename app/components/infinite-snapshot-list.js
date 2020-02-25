import Component from '@ember/component';
import {notEmpty, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';
import config from '../config/environment';
import {assert} from '@ember/debug';

export default Component.extend(EKMixin, {
  activeSnapshotBlockIndex: null,

  numSnapshotsChanged: readOnly('orderItems.length'),
  numSnapshotsUnchanged: computed('build.totalSnapshots', 'numSnapshotsChanged', function() {
    return this.build.totalSnapshots - this.numSnapshotsChanged;
  }),

  isActiveSnapshotIndex: notEmpty('activeSnapshotBlockIndex'),

  actions: {
    updateActiveSnapshotBlockIndex(newIndex) {
      this._updateActiveBlockIndex(newIndex);
    },
  },

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
  },

  onDKeyPress: on(keyDown('KeyD'), function() {
    this.toggleAllDiffs({trackSource: 'keypress'});
    this._trackKeyPress();
  }),

  onDownKeyPress: on(keyDown('ArrowDown'), function() {
    this.newIndex({isNext: true});
  }),

  onUpKeyPress: on(keyDown('ArrowUp'), function() {
    this.newIndex({isNext: false});
  }),

  newIndex({isNext = true} = {}) {
    const numItems = this.orderItems.length;
    if (!this.isUnchangedSnapshotsVisible) {
      if (!this.isActiveSnapshotIndex) {
        this._updateActiveBlockIndex(0);
      } else {
        let currentIndex = this.activeSnapshotBlockIndex;

        // // will not work with infinite scroll, as snapshots may not be loaded yet
        // // if we are moving forward and are on the last snapshot, wrap to beginning of list
        // if (isNext && currentIndex === numItems - 1) {
        //   currentIndex = -1;
        // } else if (!isNext && currentIndex === 0) {
        //   // if we are moving backward and are on the first snapshot, wrap to end of list
        //   currentIndex = numItems;
        // }

        // There's an off-by-one error somewhere here...when it hits the bottom it skips the last one
        const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < numItems && newIndex >= 0) {
          this._updateActiveBlockIndex(newIndex);
        }
      }
      this._trackKeyPress();
    } else {
      // TODO: what if unchanged snapshots _are_ visible?
    }
  },

  _updateActiveBlockIndex(newIndex) {
    this.set('activeSnapshotBlockIndex', newIndex);
  },

  _trackKeyPress() {
    this.analytics.track('Snapshot List Navigated', this.build.project.organization, {
      type: 'keyboard',
      project_id: this.build.project.id,
      build_id: this.build.id,
    });
  },

  // TODO remove this and all references to it when unchanged snapshots
  // have orderItems
  shouldDeferRendering: computed(
    'orderItems.length',
    'snapshotsUnchanged.length',
    'isUnchangedSnapshotsVisible',
    {
    get(/*key*/) {
      if (this.isUnchangedSnapshotsVisible) {
        return this.orderItems.length + this.snapshotsUnchanged.length > 75;
      } else {
        return false
      }
    },
    set(key, value) {
      assert('Only set `shouldDeferRendering` for tests.', config.environment === 'test');
      return value;
    },
  }),
});
