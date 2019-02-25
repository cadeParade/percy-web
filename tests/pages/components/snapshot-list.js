import {create, collection, clickable, isVisible, triggerable} from 'ember-cli-page-object';
import {SnapshotViewer} from 'percy-web/tests/pages/components/snapshot-viewer';
import {snapshotGroup} from 'percy-web/tests/pages/components/snapshot-group';
import {getter} from 'ember-cli-page-object/macros';
import {findElement} from 'ember-cli-page-object/extend';

const DOWN_ARROW_KEY = 40;
const UP_ARROW_KEY = 38;
const D_KEY = 68;

const SELECTORS = {
  SNAPSHOT_LIST: '[data-test-snapshot-list]',
  NO_DIFFS_TOGGLE: '[data-test-toggle-unchanged]',
  SNAPSHOT_BLOCK: '[data-test-snapshot-block]',
};

export const SnapshotList = {
  scope: SELECTORS.SNAPSHOT_LIST,

  snapshots: collection(SnapshotViewer.scope, SnapshotViewer),

  snapshotTitles: getter(function() {
    return this.snapshots.map(snapshot => snapshot.name);
  }),

  lastSnapshot: getter(function() {
    const numSnapshots = this.snapshots.length;
    return this.snapshots.objectAt(numSnapshots - 1);
  }),

  indexOfSnapshot(snapshot) {
    return this.snapshots.indexOf(snapshot);
  },

  approvedSnapshots() {
    return this.snapshots.toArray().filterBy('isApproved', true);
  },

  unapprovedSnapshots() {
    return this.snapshots.toArray().filterBy('isUnapproved', true);
  },

  noDiffSnapshots() {
    return this.snapshots.toArray().filter(snapshot => {
      return snapshot.isApproved && snapshot.isUnchanged;
    });
  },

  isNoDiffsBatchVisible: isVisible(SELECTORS.NO_DIFFS_TOGGLE),
  clickToggleNoDiffsSection: clickable(SELECTORS.NO_DIFFS_TOGGLE),

  isDiffsVisibleForAllSnapshots: getter(function() {
    return this.snapshots.toArray().every(snapshot => {
      return snapshot.isDiffImageVisible;
    });
  }),

  typeDownArrow: triggerable('keydown', '', {
    eventProperties: {keyCode: DOWN_ARROW_KEY},
  }),
  typeUpArrow: triggerable('keydown', '', {
    eventProperties: {keyCode: UP_ARROW_KEY},
  }),
  typeDiffToggleKey: triggerable('keydown', '', {
    eventProperties: {keyCode: D_KEY},
  }),

  _groups: collection(snapshotGroup.scope),

  snapshotBlocks: collection(SELECTORS.SNAPSHOT_BLOCK, {
    snapshotGroup: snapshotGroup,
    snapshotViewer: SnapshotViewer,
    _block: getter(function() {
      return this.isSnapshot ? this.snapshotViewer : this.snapshotGroup;
    }),

    isGroup: getter(function() {
      return !!findElement(this, this.snapshotGroup.scope).length;
    }),
    isSnapshot: getter(function() {
      return !!findElement(this, this.snapshotViewer.scope).length;
    }),

    isApproved: getter(function() {
      return this._block.isApproved;
    }),
    name: getter(function() {
      return this._block.name;
    }),
    async clickApprove() {
      return await this._block.clickApprove();
    },
  }),
};

export default create(SnapshotList);
