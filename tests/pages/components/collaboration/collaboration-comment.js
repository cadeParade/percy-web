import {create, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-collaboration-comment]',
  RESOLVE_BUTTON: '[data-test-percy-btn-label=commentResolve]',
  ARCHIVE_BUTTON: '[data-test-percy-btn-label=commentArchive]',
  RESOLVED_INDICATOR: '[data-test-resolved]',
  ARCHIVED_INDICATOR: '[data-test-archived]',
};

export const collaborationComment = {
  scope: SELECTORS.SCOPE,

  resolveButton: {
    scope: SELECTORS.RESOLVE_BUTTON,
  },

  archiveButton: {
    scope: SELECTORS.ARCHIVE_BUTTON,
  },

  isResolved: isVisible(SELECTORS.RESOLVED_INDICATOR),
  isArchived: isVisible(SELECTORS.ARCHIVED_INDICATOR),
};

export default create(collaborationComment);
