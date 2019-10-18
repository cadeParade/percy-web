import {attribute, clickable, create, hasClass, isVisible, text} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-collaboration-comment]',
  RESOLVE_BUTTON: '[data-test-percy-btn-label=commentResolve]',
  ARCHIVE_BUTTON: '[data-test-percy-btn-label=commentArchive]',
  ARCHIVED_INDICATOR: '[data-test-archived]',
  RESOLVED_INDICATOR: '[data-test-resolved]',
  CREATED_AT: '[data-test-comment-created-at]',
  REQUEST_CHANGES_BADGE: '[data-test-request-changes-badge]',
  ORIGINATING_SNAPSHOT_LINK: '[data-test-originating-snapshot-link]',
};

export const collaborationComment = {
  scope: SELECTORS.SCOPE,

  resolveButton: {
    scope: SELECTORS.RESOLVE_BUTTON,
  },

  archiveButton: {
    scope: SELECTORS.ARCHIVE_BUTTON,
  },

  isArchived: isVisible(SELECTORS.ARCHIVED_INDICATOR),
  isResolved: isVisible(SELECTORS.RESOLVED_INDICATOR),

  createdAt: text(SELECTORS.CREATED_AT),

  close() {
    if (this.resolveButton.isVisible) {
      return this.resolveButton.click();
    } else if (this.archiveButton.isVisible) {
      return this.archiveButton.click();
    }
  },

  requestChangesBadge: {
    scope: SELECTORS.REQUEST_CHANGES_BADGE,
    isRequestedPreviously: hasClass('text-orange-500'),
    goToOriginatingSnapshot: clickable(SELECTORS.ORIGINATING_SNAPSHOT_LINK),
    previousBuildLinkHref: attribute('href', 'a'),
  },
};

export default create(collaborationComment);
