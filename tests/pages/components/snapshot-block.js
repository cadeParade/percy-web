import {create} from 'ember-cli-page-object';
import {SnapshotViewer} from 'percy-web/tests/pages/components/snapshot-viewer';
import {snapshotGroup} from 'percy-web/tests/pages/components/snapshot-group';
import {findElement} from 'ember-cli-page-object/extend';
import {getter} from 'ember-cli-page-object/macros';
import {alias} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SNAPSHOT_BLOCK: '[data-test-snapshot-block]',
};

export const snapshotBlock = {
  scope: SELECTORS.SNAPSHOT_BLOCK,
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

  isFocused: alias('_block.isFocused'),

  header: alias('_block.header'),
  isApproved: alias('_block.isApproved'),
  name: alias('_block.name'),
  clickApprove: alias('_block.clickApprove'),
  clickToggleFullscreen: alias('header.clickToggleFullscreen'),
  isLazyRenderHeaderVisible: alias('_block.isLazyRenderHeaderVisible'),
  isDiffImageVisible: alias('_block.isDiffImageVisible'),
  clickDiffImage: alias('_block.clickDiffImage'),
};

export default create(snapshotBlock);
