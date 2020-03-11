import Component from '@ember/component';
import {notEmpty, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';
import config from '../config/environment';
import {assert} from '@ember/debug';
import {idsFromOrderItems} from 'percy-web/components/load-snapshots';

export default Component.extend(EKMixin, {
  attributeBindings: ['data-test-snapshot-list'],
  'data-test-snapshot-list': true,

  activeSnapshotBlockIndex: null,
  orderItems: [],

  numSnapshotsChanged: readOnly('orderItems.length'),
  numSnapshotsUnchanged: computed('build.totalSnapshots', 'orderItems', function() {
    return this.build.totalSnapshots - idsFromOrderItems(this.orderItems).length;
  }),

  isActiveSnapshotIndex: notEmpty('activeSnapshotBlockIndex'),

  actions: {
    updateActiveSnapshotBlockIndex(newIndex) {
      this._updateActiveBlockIndex(newIndex);
    },
    // TODO(sort) should this be fixed?
    updateActiveSnapshotBlockId() {},
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

        // TODO(sort) There's an off-by-one error somewhere here
        // ...when it hits the bottom it skips the last one
        const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < numItems && newIndex >= 0) {
          this._updateActiveBlockIndex(newIndex);
        }
      }
      this._trackKeyPress();
    } else {
      // TODO(sort): what if unchanged snapshots _are_ visible?
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

  // TODO(sort) remove this and all references to it when unchanged snapshots
  // have orderItems
  shouldDeferRendering: computed(
    'snapshotsUnchanged.length',
    'isUnchangedSnapshotsVisible',
    {
      get(/*key*/) {
        return this.isUnchangedSnapshotsVisible ? this.snapshotsUnchanged.length > 75 : false;
        // if (this.isUnchangedSnapshotsVisible) {
        //   return this.snapshotsUnchanged.length > 75;
        // } else {
        //   return false;
        // }
      },
      set(key, value) {
        assert('Only set `shouldDeferRendering` for tests.', config.environment === 'test');
        return value;
      },
    },
  ),
});
