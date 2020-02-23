import Component from '@ember/component';
import {notEmpty, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';

export default Component.extend(EKMixin, {
  page: 0,
  activeSnapshotBlockIndex: null,

  numSnapshotsChanged: readOnly('orderItems.items.length'),
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

  onDownKeyPress: on(keyDown('ArrowDown'), function() {
    this.newIndex({isNext: true});
  }),

  onUpKeyPress: on(keyDown('ArrowUp'), function() {
    this.newIndex({isNext: false});
  }),

  newIndex({isNext = true} = {}) {
    const numItems = this.orderItems.items.length;
    const currentIndex = this.activeSnapshotBlockIndex;
    if (!this.isUnchangedSnapshotsVisible) {
      if (!this.isActiveSnapshotIndex) {
        this._updateActiveBlockIndex(0);
      } else {
        const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
        // const nextIndex = this.activeSnapshotBlockIndex + 1;
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
});
