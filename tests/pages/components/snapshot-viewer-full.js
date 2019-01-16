import {create, attribute, isVisible, triggerable, clickable} from 'ember-cli-page-object';
import {SnapshotViewerHeader} from 'percy-web/tests/pages/components/snapshot-viewer-header';
import {alias} from 'ember-cli-page-object/macros';

const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;
const ESCAPE_KEY = 27;
const DOWN_ARROW = 40;
const UP_ARROW = 38;

const SELECTORS = {
  SNAPSHOT_VIEWER_FULL: '[data-test-snapshot-viewer-full]',
  HEADER: '[data-test-SnapshotViewer-header]',
  COMPARISON: '[data-test-SnapshotViewer-comparison]',
  NO_COMPARISON: '[data-test-SnapshotViewer-noComparison]',
  COMPARISON_VIEWER: '[data-test-SnapshotViewerFull-comparison-viewer]',
  COMPARISON_IMAGE: '[data-test-SnapshotViewerFull-comparison-viewer] img',
  COMPARISON_MODE_SWITCHER: '[data-test-comparison-mode-switcher]',
  DIFF_IMAGE: '[data-test-comparison-viewer-full-diff-image-overlay] img',
  DIFF_IMAGE_BOX: '[data-test-comparison-viewer-diff-image-container] img',
  PUBLIC_BUILD_NOTICE: '[data-test-public-project-notice]',
  NEXT_SNAPSHOT: '[data-test-next-snapshot]',
  PREV_SNAPSHOT: '[data-test-previous-snapshot]',
};

export const SnapshotViewerFull = {
  // something about ember-modal-dialog requires the test container to be explicitly set.
  testContainer: '#ember-testing-container',
  scope: SELECTORS.SNAPSHOT_VIEWER_FULL,
  header: SnapshotViewerHeader,

  clickBaseComparisonMode: alias('header.clickBaseComparisonMode'),
  clickDiffComparisonMode: alias('header.clickDiffComparisonMode'),
  clickHeadComparisonMode: alias('header.clickHeadComparisonMode'),

  comparisonImageUrl: attribute('src', SELECTORS.COMPARISON_IMAGE),
  diffImageUrl: attribute('src', SELECTORS.DIFF_IMAGE),

  clickNextSnapshot: clickable(SELECTORS.NEXT_SNAPSHOT),
  clickPreviousSnapshot: clickable(SELECTORS.PREV_SNAPSHOT),

  typeLeftArrow: triggerable('keydown', '', {
    eventProperties: {keyCode: LEFT_ARROW_KEY},
  }),
  typeRightArrow: triggerable('keydown', '', {
    eventProperties: {keyCode: RIGHT_ARROW_KEY},
  }),
  typeEscape: triggerable('keydown', '', {
    eventProperties: {keyCode: ESCAPE_KEY},
  }),
  typeUpArrow: triggerable('keydown', '', {
    eventProperties: {keyCode: UP_ARROW},
  }),
  typeDownArrow: triggerable('keydown', '', {
    eventProperties: {keyCode: DOWN_ARROW},
  }),

  clickComparisonViewer: clickable(SELECTORS.COMPARISON_VIEWER),

  isComparisonModeSwitcherVisible: alias('header.isComparisonModeSwitcherVisible'),
  isNewComparisonModeButtonVisible: alias('header.isNewComparisonModeButtonVisible'),

  clickToggleFullScreen: alias('header.clickToggleFullscreen'),

  clickApprove: alias('header.clickApprove'),

  isPublicBuildNoticeVisible: isVisible(SELECTORS.PUBLIC_BUILD_NOTICE),
};

export default create(SnapshotViewerFull);
