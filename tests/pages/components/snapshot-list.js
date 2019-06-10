import {create, collection, clickable, isVisible} from 'ember-cli-page-object';
import {SnapshotViewer} from 'percy-web/tests/pages/components/snapshot-viewer';
import {snapshotBlock} from 'percy-web/tests/pages/components/snapshot-block';
import {getter} from 'ember-cli-page-object/macros';
import {keyDown} from 'ember-keyboard/test-support/test-helpers';

const SELECTORS = {
  SNAPSHOT_LIST: '[data-test-snapshot-list]',
  NO_DIFFS_TOGGLE: '[data-test-toggle-unchanged]',
};

export const SnapshotList = {
  scope: SELECTORS.SNAPSHOT_LIST,

  // Use this instead of `snapshotBlocks` property when interacting with a snapshot list
  // with ONLY snapshot viewer components, not heterogeneous snapshot-viewer/snapshot-groups
  snapshots: collection(SnapshotViewer.scope, SnapshotViewer),
  // Use this instead of `snapshots` property when looking at a snapshot list with both
  // snapshot-viewer components and snapshot-group components.
  snapshotBlocks: collection(snapshotBlock.scope, snapshotBlock),

  snapshotTitles: getter(function() {
    return this.snapshotBlocks.map(snapshot => snapshot.name);
  }),

  lastSnapshot: getter(function() {
    const numSnapshots = this.snapshots.length;
    return this.snapshots.objectAt(numSnapshots - 1);
  }),

  isNoDiffsBatchVisible: isVisible(SELECTORS.NO_DIFFS_TOGGLE),
  clickToggleNoDiffsSection: clickable(SELECTORS.NO_DIFFS_TOGGLE),

  isDiffsVisibleForAllSnapshots: getter(function() {
    return this.snapshotBlocks.toArray().every(block => {
      return block.isDiffImageVisible;
    });
  }),

  async typeDownArrow() {
    await keyDown('ArrowDown');
  },
  async typeUpArrow() {
    await keyDown('ArrowUp');
  },
  async typeDiffToggleKey() {
    await keyDown('KeyD');
  },
};

export default create(SnapshotList);
