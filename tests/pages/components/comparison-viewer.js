import {create, isVisible, clickable} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-comparison-viewer]',
  DIFF_IMAGE: '[data-test-comparison-viewer-full-diff-image-overlay] img',
  DIFF_IMAGE_BOX: '[data-test-comparison-viewer-diff-image-container] img',
  NO_DIFF_BOX: '[data-test-comparison-viewer-unchanged]',
};

export const comparisonViewer = {
  scope: SELECTORS.scope,
  isDiffImageVisible: isVisible(SELECTORS.DIFF_IMAGE),
  clickDiffImage: clickable(SELECTORS.DIFF_IMAGE),

  isDiffImageBoxVisible: isVisible(SELECTORS.DIFF_IMAGE_BOX),
  clickDiffImageBox: clickable(SELECTORS.DIFF_IMAGE_BOX),

  isNoDiffBoxVisible: isVisible(SELECTORS.NO_DIFF_BOX),
};

export default create(comparisonViewer);
