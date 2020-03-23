import {visitable, create, clickable, isVisible, collection} from 'ember-cli-page-object';
import {SnapshotViewerFull} from 'percy-web/tests/pages/components/snapshot-viewer-full';
import {SnapshotList} from 'percy-web/tests/pages/components/snapshot-list';
import {alias} from 'ember-cli-page-object/macros';
import {BuildApprovalButton} from 'percy-web/tests/pages/components/build-approval-button';
import {BuildInfoDropdown} from 'percy-web/tests/pages/components/build-info-dropdown';
import {BrowserSwitcher} from 'percy-web/tests/pages/components/browser-switcher';
import {BuildToolbar} from 'percy-web/tests/pages/components/build-toolbar';
import {DemoTooltip} from 'percy-web/tests/pages/components/demo-tooltip';
import {confirmDialog} from 'percy-web/tests/pages/components/confirm-dialog';
import {RemovedSnapshots} from 'percy-web/tests/pages/components/removed-snapshots';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SHOW_SUPPORT_LINK: '[data-test-build-overview-show-support]',
  PUBLIC_BUILD_NOTICE: '[data-test-public-project-notice]',
};

const BuildPage = {
  visitBuild: visitable('/:orgSlug/:projectSlug/builds/:buildId'),
  visitFullPageSnapshot: visitable('/:orgSlug/:projectSlug/builds/:buildId/view/:snapshotId'),

  buildToolbar: BuildToolbar,
  removedSnapshots: RemovedSnapshots,

  browserSwitcher: BrowserSwitcher,
  buildApprovalButton: BuildApprovalButton,
  approve: alias('buildApprovalButton.clickButton'),
  buildInfoDropdown: BuildInfoDropdown,

  toggleBuildInfoDropdown: alias('buildInfoDropdown.toggleBuildInfoDropdown'),

  isUnchangedPanelVisible: alias('snapshotList.isNoDiffsBatchVisible'),
  clickToggleNoDiffsSection: alias('snapshotList.clickToggleNoDiffsSection'),

  confirmDialog,
  isConfirmDialogVisible: alias('confirmDialog.isVisible'),
  cancelConfirm: alias('confirmDialog.cancel.click'),
  continueConfirm: alias('confirmDialog.confirm.click'),

  snapshotList: SnapshotList,
  snapshots: alias('snapshotList.snapshots'),
  snapshotBlocks: alias('snapshotList.snapshotBlocks'),

  isFirstSnapshotApproved: getter(function () {
    return this.snapshots[0].isApproved;
  }),

  async approveFirstSnapshot() {
    return await this.snapshots[0].clickApprove();
  },

  async rejectFirstSnapshot() {
    return await this.snapshots[0].clickReject();
  },

  snapshotTitles: getter(function () {
    return this.snapshots.map(snapshot => snapshot.name);
  }),

  findSnapshotByName(name) {
    return this.snapshots.toArray().findBy('name', name);
  },

  focusedSnapshot() {
    return this.snapshots.toArray().findBy('isFocused', true);
  },

  urlWithSnapshotQueryParam(snapshot, build) {
    return `/${build.project.fullSlug}/builds/${build.id}?snapshot=${snapshot.id}`;
  },

  clickToggleDiffsButton: alias('buildToolbar.clickToggleDiffsButton'),
  isDiffsVisibleForAllSnapshots: alias('snapshotList.isDiffsVisibleForAllSnapshots'),

  clickProject: alias('buildToolbar.clickProject'),
  isPublicProjectIconVisible: alias('buildToolbar.isPublicProjectIconVisible'),

  typeDownArrow: alias('snapshotList.typeDownArrow'),
  typeUpArrow: alias('snapshotList.typeUpArrow'),
  typeDiffToggleKey: alias('snapshotList.typeDiffToggleKey'),

  snapshotFullscreen: SnapshotViewerFull,
  isFullscreenModalVisible: isVisible(SELECTORS.SNAPSHOT_FULL_MODAL),

  clickShowSupportLink: clickable(SELECTORS.SHOW_SUPPORT_LINK),

  isPublicBuildNoticeVisible: isVisible(SELECTORS.PUBLIC_BUILD_NOTICE),

  demoTooltips: collection(DemoTooltip.wrapperScope, DemoTooltip),
  nextableDemoTooltips: collection(DemoTooltip.nextableScope, DemoTooltip),
};

export default create(BuildPage);
