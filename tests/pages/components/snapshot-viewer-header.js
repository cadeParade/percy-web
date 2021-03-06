import {
  create,
  clickable,
  isVisible,
  hasClass,
  text,
  collection,
  property,
  isPresent,
} from 'ember-cli-page-object';
import {SnapshotApprovalButton} from 'percy-web/tests/pages/components/snapshot-approval-button';
import {alias} from 'ember-cli-page-object/macros';
import clickDropdownTrigger from 'percy-web/tests/pages/helpers/click-basic-dropdown-trigger';
import {getter} from 'ember-cli-page-object/macros';

const SELECTORS = {
  HEADER: '[data-test-SnapshotViewer-header]',
  COMPARISON_ICON: '[data-test-SnapshotViewer-comparisonIcon]',
  TITLE: '[data-test-SnapshotViewer-title]',
  WIDTH_SWITCHER: '[data-test-SnapshotViewer-widthSwitcher]',
  WIDTH_SWITCHER_BUTTON: '[data-test-ComparisonSwitcher-button]',
  FULL_SCREEN_TOGGLE: '[data-test-SnapshotViewer-toggleFullScreen]',
  COMPARISON_MODE_SWITCHER: '[data-test-SnapshotViewer-comparison-mode-switcher]',
  COMPARISON_MODE_SWITCHER_BASE: '[data-test-comparison-mode-switcher-base]',
  COMPARISON_MODE_SWITCHER_DIFF: '[data-test-comparison-mode-switcher-diff]',
  COMPARISON_MODE_SWITCHER_HEAD: '[data-test-comparison-mode-switcher-head]',
  COMPARISON_MODE_SWITCHER_NEW: '[data-test-comparison-mode-switcher-new]',
  DROPDOWN_TOGGLE: '[data-test-snapshot-header-dropdown-toggle]',
  DROPDOWN_PANE: '[data-test-snapshot-header-dropdown-pane]',
  DROPDOWN_PANE_ITEMS: '[data-test-snapshot-header-dropdown-pane] li',
  DROPDOWN_TOGGLE_WIDTHS_OPTION: '[data-test-toggle-widths-option]',
  APPROVAL_BUTTON_SCOPE: '[data-test-snapshot-approval-button]',
  TOGGLE_COMMENT_SIDEBAR: '[data-test-toggle-comment-sidebar]',
  OPEN_COMMENT_THREAD_COUNT: '[data-test-comment-thread-count]',
  SNAPSHOT_REJECT_BUTTON: '[data-test-snapshot-reject-button]',
  REQUEST_CHANGES_BADGE: '[data-test-request-changes-badge]',
};

export const SnapshotViewerHeader = {
  scope: SELECTORS.HEADER,
  isTitleVisible: isVisible(SELECTORS.TITLE),
  titleText: text(SELECTORS.TITLE),

  expandSnapshot: clickable(),

  isComparisonModeSwitcherVisible: getter(function () {
    return this._isComparisonModeSwitcherPresent && !this._isComparisonModeSwitcherInvisible;
  }),

  isWidthSwitcherVisible: isVisible(SELECTORS.WIDTH_SWITCHER),

  widthSwitcher: {
    scope: SELECTORS.WIDTH_SWITCHER,
    buttons: collection(SELECTORS.WIDTH_SWITCHER_BUTTON, {
      isActive: hasClass('is-selected'),
      text: text(),
    }),
  },

  activeWidthButton: getter(function () {
    return this.widthSwitcher.buttons.toArray().findBy('isActive');
  }),

  isFullScreenToggleVisible: isVisible(SELECTORS.FULL_SCREEN_TOGGLE),
  clickToggleFullscreen: clickable(SELECTORS.FULL_SCREEN_TOGGLE),

  clickBaseComparisonMode: clickable(SELECTORS.COMPARISON_MODE_SWITCHER_BASE),
  clickDiffComparisonMode: clickable(SELECTORS.COMPARISON_MODE_SWITCHER_DIFF),
  clickHeadComparisonMode: clickable(SELECTORS.COMPARISON_MODE_SWITCHER_HEAD),

  async clickDropdownToggle() {
    await clickDropdownTrigger(SELECTORS.HEADER);
  },
  isDropdownToggleVisible: isVisible(SELECTORS.DROPDOWN_TOGGLE),
  isDropdownPaneVisible: isPresent(SELECTORS.DROPDOWN_PANE, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),
  dropdownOptions: collection(SELECTORS.DROPDOWN_PANE_ITEMS, {
    resetScope: true,
    testContainer: '#ember-testing-container',
    text: text(),
  }),
  isToggleWidthsOptionVisible: isVisible(SELECTORS.DROPDOWN_TOGGLE_WIDTHS_OPTION, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),

  clickToggleAllWidths: clickable(SELECTORS.DROPDOWN_TOGGLE_WIDTHS_OPTION, {
    resetScope: true,
    testContainer: '#ember-testing-container',
  }),

  // We are setting scope here because this component doesn't have a tag
  // and therefore cannot set its own scope.
  snapshotApprovalButton: Object.assign(
    {
      scope: SELECTORS.APPROVAL_BUTTON_SCOPE,
    },
    SnapshotApprovalButton,
  ),

  clickApprove: alias('snapshotApprovalButton.clickButton'),
  isApproved: alias('snapshotApprovalButton.isApproved'),
  isUnapproved: alias('snapshotApprovalButton.isUnapproved'),
  isUnchanged: alias('snapshotApprovalButton.isUnchanged'),

  clickReject: clickable(SELECTORS.SNAPSHOT_REJECT_BUTTON),
  isRejectButtonPresent: isPresent(SELECTORS.SNAPSHOT_REJECT_BUTTON),
  isRejectButtonDisabled: property('disabled', SELECTORS.SNAPSHOT_REJECT_BUTTON),
  isRejected: isVisible(SELECTORS.REQUEST_CHANGES_BADGE),

  isBaseComparisonModeButtonVisible: isVisible(SELECTORS.COMPARISON_MODE_SWITCHER_BASE),
  isBaseComparisonModeSelected: hasClass('is-selected', SELECTORS.COMPARISON_MODE_SWITCHER_BASE),
  isDiffComparisonModeButtonVisible: isVisible(SELECTORS.COMPARISON_MODE_SWITCHER_DIFF),
  isDiffComparisonModeSelected: hasClass('is-selected', SELECTORS.COMPARISON_MODE_SWITCHER_DIFF),
  isHeadComparisonModeButtonVisible: isVisible(SELECTORS.COMPARISON_MODE_SWITCHER_HEAD),
  isHeadComparisonModeSelected: hasClass('is-selected', SELECTORS.COMPARISON_MODE_SWITCHER_HEAD),

  isNewComparisonModeButtonVisible: isVisible(SELECTORS.COMPARISON_MODE_SWITCHER_NEW),

  _isComparisonModeSwitcherPresent: isPresent(SELECTORS.COMPARISON_MODE_SWITCHER),
  _isComparisonModeSwitcherInvisible: hasClass('is-invisible', SELECTORS.COMPARISON_MODE_SWITCHER),

  isToggleCommentSidebarVisible: isVisible(SELECTORS.TOGGLE_COMMENT_SIDEBAR),
  toggleCommentSidebar: clickable(SELECTORS.TOGGLE_COMMENT_SIDEBAR),
  numOpenCommentThreads: text(SELECTORS.OPEN_COMMENT_THREAD_COUNT),
};

export default create(SnapshotViewerHeader);
