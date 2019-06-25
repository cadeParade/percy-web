import {
  clickable,
  collection,
  create,
  hasClass,
  isVisible,
  notHasClass,
  text,
} from 'ember-cli-page-object';
import {groupApprovalButton} from 'percy-web/tests/pages/components/group-approval-button';
import {alias} from 'ember-cli-page-object/macros';
import {SnapshotViewer} from 'percy-web/tests/pages/components/snapshot-viewer';
import {comparisonViewer} from 'percy-web/tests/pages/components/comparison-viewer';

const SELECTORS = {
  SCOPE: '[data-test-snapshot-group]',
  APPROVED_BUBBLE: '[data-test-group-approved]',
  NAME: '[data-test-snapshot-group-name]',
  WIDTH_SWITCHER: '[data-test-comparison-switcher]',
  WIDTH_SWITCHER_BUTTON: '[data-test-ComparisonSwitcher-button]',
  FULL_SCREEN_TOGGLE: '[data-test-snapshot-header-dropdown-toggle]',
  HEADER: '[data-test-snapshot-group-header]',
  SHOW_ALL_SNAPSHOTS_TOGGLE: '[data-test-show-group-snapshots]',
  LAZY_RENDER_HEADER: '[data-test-snapshot-viewer-lazy-header]',
  COMMENT_BUTTON: '[data-test-group-comment-btn]',
};

export const snapshotGroup = {
  scope: SELECTORS.SCOPE,
  comparisonViewer,

  name: alias('header.name'),

  isApproved: alias('header.groupApprovalButton.isApproved'),
  clickApprove: alias('header.groupApprovalButton.clickButton'),
  toggleShowAllSnapshots: alias('header.toggleShowAllSnapshots'),

  isCollapsed: hasClass('SnapshotViewer--collapsed'),
  isExpanded: notHasClass('SnapshotViewer--collapsed'),

  snapshots: collection(SnapshotViewer.scope, SnapshotViewer),
  isFocused: hasClass('SnapshotViewer--focus'),
  isLazyRenderHeaderVisible: isVisible(SELECTORS.LAZY_RENDER_HEADER),

  isDiffImageVisible: alias('comparisonViewer.isDiffImageVisible'),
  clickDiffImage: alias('comparisonViewer.clickDiffImage'),

  isDiffImageBoxVisible: alias('comparisonViewer.isDiffImageVisible'),
  clickDiffImageBox: alias('comparisonViewer.SELECTORS.clickDiffImage'),

  isNoDiffBoxVisible: alias('comparisonViewer.SELECTORS.isNoDiffBoxVisible'),

  approveButton: alias('header.groupApprovalButton'),

  header: {
    scope: SELECTORS.HEADER,
    name: text(SELECTORS.NAME),
    expandGroup: clickable(),

    // We are setting scope here because this component doesn't have a tag
    // and therefore cannot set its own scope.
    groupApprovalButton: Object.assign(
      {
        scope: SELECTORS.APPROVAL_BUTTON_SCOPE,
      },
      groupApprovalButton,
    ),

    isApproved: alias('groupApprovalButton.isApproved'),
    clickApprove: alias('groupApprovalButton.clickButton'),
    widthSwitcher: {
      scope: SELECTORS.WIDTH_SWITCHER,
      buttons: collection(SELECTORS.WIDTH_SWITCHER_BUTTON, {
        isActive: hasClass('is-active'),
        text: text(),
      }),
    },
    clickToggleFullscreen: clickable(SELECTORS.FULL_SCREEN_TOGGLE),
    isFullScreenToggleVisible: isVisible(SELECTORS.FULL_SCREEN_TOGGLE),
    toggleShowAllSnapshots: clickable(SELECTORS.SHOW_ALL_SNAPSHOTS_TOGGLE),
    clickCommentButton: clickable(SELECTORS.COMMENT_BUTTON),
  },
};

export default create(snapshotGroup);
