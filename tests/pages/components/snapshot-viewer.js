import {create, isVisible, hasClass, notHasClass} from 'ember-cli-page-object';
import {SnapshotViewerHeader} from 'percy-web/tests/pages/components/snapshot-viewer-header';
import {alias} from 'ember-cli-page-object/macros';
import {comparisonViewer} from 'percy-web/tests/pages/components/comparison-viewer';

const SELECTORS = {
  SNAPSHOT_VIEWER: '[data-test-snapshot-viewer]',
  LAZY_RENDER_HEADER: '[data-test-snapshot-viewer-lazy-header]',
  SHOW_UNCHANGED_COMPARISONS: '[data-test-comaprison-viewer-show-unchanged-comparisons]',
};

export const SnapshotViewer = {
  scope: SELECTORS.SNAPSHOT_VIEWER,
  comparisonViewer,

  header: SnapshotViewerHeader,
  widthSwitcher: alias('header.widthSwitcher'),
  name: alias('header.titleText'),
  expandSnapshot: alias('header.expandSnapshot'),

  isApproved: alias('header.isApproved'),
  isUnapproved: alias('header.isUnapproved'),
  isUnchanged: alias('header.isUnchanged'),

  isCollapsed: hasClass('SnapshotViewer--collapsed'),
  isExpanded: notHasClass('SnapshotViewer--collapsed'),

  isDiffImageVisible: alias('comparisonViewer.isDiffImageVisible'),
  clickDiffImage: alias('comparisonViewer.clickDiffImage'),

  isDiffImageBoxVisible: alias('comparisonViewer.isDiffImageVisible'),
  clickDiffImageBox: alias('comparisonViewer.clickDiffImageBox'),

  isNoDiffBoxVisible: alias('comparisonViewer.isNoDiffBoxVisible'),

  isFocused: hasClass('SnapshotViewer--focus'),

  isActionable: hasClass('SnapshotViewer--actionable'),

  isUnchangedComparisonsVisible: isVisible(SELECTORS.SHOW_UNCHANGED_COMPARISONS),

  clickApprove: alias('header.clickApprove'),

  isLazyRenderHeaderVisible: isVisible(SELECTORS.LAZY_RENDER_HEADER),
};

export default create(SnapshotViewer);
