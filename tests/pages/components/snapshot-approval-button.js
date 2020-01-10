import {clickable, create, hasClass, property, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  BUTTON: '[data-test-SnapshotViewerHeader-approve]',
  APPROVED_PILL: '[data-test-snapshot-approved-pill]',
  NO_CHANGES_IN_BROWSER_PILL: '[data-test-no-changes-in-browser]',
};

export const SnapshotApprovalButton = {
  clickButton: clickable(SELECTORS.BUTTON),
  button: {
    scope: SELECTORS.BUTTON,
    isLoading: hasClass('is-loading'),
  },

  isApproved: isVisible(SELECTORS.APPROVED_PILL),
  isUnapproved: isVisible(SELECTORS.BUTTON),
  isUnchanged: hasClass('is-unchanged', SELECTORS.APPROVED_PILL),
  isNoChangeInBrowserVisible: isVisible(SELECTORS.NO_CHANGES_IN_BROWSER_PILL),
  isDisabled: property('disabled', SELECTORS.BUTTON),
};

export default create(SnapshotApprovalButton);
