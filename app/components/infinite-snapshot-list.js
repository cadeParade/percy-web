import Component from '@ember/component';
import {notEmpty, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';
import config from '../config/environment';
import {assert} from '@ember/debug';
import {idsFromOrderItems} from 'percy-web/lib/metadata-sort';

export default Component.extend(EKMixin, {
  attributeBindings: ['data-test-snapshot-list'],
  'data-test-snapshot-list': true,

  activeSnapshotBlockIndex: null,

  numSnapshotsChanged: readOnly('blockItems.length'),
  numSnapshotsUnchanged: computed('build.totalSnapshots', 'blockItems', function () {
    return this.build.totalSnapshots - idsFromOrderItems(this.blockItems).length;
  }),

  isActiveSnapshotIndex: notEmpty('activeSnapshotBlockIndex'),

  actions: {
    updateActiveSnapshotBlockIndex(newIndex) {
      this._updateActiveBlockIndex(newIndex);
    },
    // TODO(sort) remove when unchanged items have indexes
    updateActiveSnapshotBlockId() {},
  },

  init() {
    this._super(...arguments);
    this.blockItems = this.blockItems || [];
    this.set('keyboardActivated', true);
  },

  onDKeyPress: on(keyDown('KeyD'), function () {
    this.toggleAllDiffs({trackSource: 'keypress'});
    this._trackKeyPress();
  }),

  onDownKeyPress: on(keyDown('ArrowDown'), function () {
    this.newIndex({isNext: true});
  }),

  onUpKeyPress: on(keyDown('ArrowUp'), function () {
    this.newIndex({isNext: false});
  }),

  newIndex({isNext = true} = {}) {
    // TODO(sort): handle keyboard nav for unchanged snapshots when they have indexes
    const numItems = this.blockItems.length;
    if (!this.isActiveSnapshotIndex) {
      this._updateActiveBlockIndex(0);
    } else {
      let currentIndex = this.activeSnapshotBlockIndex;

      const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < numItems && newIndex >= 0) {
        this._updateActiveBlockIndex(newIndex);
      }
    }
    this._trackKeyPress();
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
  // have blockItems
  shouldDeferRendering: computed('snapshotsUnchanged.length', 'isUnchangedSnapshotsVisible', {
    get(/*key*/) {
      return this.isUnchangedSnapshotsVisible ? this.snapshotsUnchanged.length > 75 : false;
    },
    set(key, value) {
      assert('Only set `shouldDeferRendering` for tests.', config.environment === 'test');
      return value;
    },
  }),
});
