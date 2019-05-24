import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import CollaborationComment from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

describe('Integration: CollaborationComment', function() {
  setupRenderingTest('collaboration-comment', {
    integration: true,
  });

  beforeEach(async function() {
    setupFactoryGuy(this);
    CollaborationComment.setContext(this);
  });

  let closeCommentThreadStub;
  describe('when `isFirstComment` is true', function() {
    beforeEach(async function() {
      closeCommentThreadStub = sinon.stub();
      this.setProperties({
        isFirstComment: true,
        comment: {}, // to be set below
        closeCommentThreadStub,
      });
      await this.render(hbs`{{collaboration/collaboration-comment
        comment=comment
        isFirstComment=isFirstComment
        closeCommentThread=closeCommentThreadStub
      }}`);
    });

    describe('when the comment thread is open', function() {
      it('shows "Resolve" button when isResolvable is true', async function() {
        const comment = make('comment', 'fromReviewThread');
        this.setProperties({comment});

        expect(CollaborationComment.resolveButton.isVisible).to.equal(true);
        expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
        await percySnapshot(this.test);
      });

      it('shows "Archive" button when isResolvable is false', async function() {
        const comment = make('comment', 'fromNoteThread');
        this.setProperties({comment});

        expect(CollaborationComment.resolveButton.isVisible).to.equal(false);
        expect(CollaborationComment.archiveButton.isVisible).to.equal(true);
        await percySnapshot(this.test);
      });
    });

    describe('when the comment thread is closed', function() {
      it('shows "Resolved" indication when comment thread is resolved', async function() {
        const comment = make('comment', 'fromResolvedThread');
        this.setProperties({comment});

        expect(CollaborationComment.isResolved).to.equal(true);
        expect(CollaborationComment.isArchived).to.equal(false);
        await percySnapshot(this.test);
      });

      it('shows "Archived" indication when comment thread is closed', async function() {
        const comment = make('comment', 'fromArchivedThread');
        this.setProperties({comment});

        expect(CollaborationComment.isResolved).to.equal(false);
        expect(CollaborationComment.isArchived).to.equal(true);
        await percySnapshot(this.test);
      });
    });

    describe('closing a comment', function() {
      it('calls closeComment with review comment thread', async function() {
        const comment = make('comment', 'fromReviewThread');
        this.setProperties({comment});

        await CollaborationComment.resolveButton.click();
        expect(closeCommentThreadStub).to.have.been.calledWith(comment.commentThread);
      });

      it('calls closeComment with note comment thread', async function() {
        const comment = make('comment', 'fromNoteThread');
        this.setProperties({comment});

        await CollaborationComment.archiveButton.click();
        expect(closeCommentThreadStub).to.have.been.calledWith(comment.commentThread);
      });
    });
  });

  describe('when `isFirstComment` is false', function() {
    beforeEach(async function() {
      this.setProperties({isFirstComment: false, comment: {}});
      await this.render(hbs`{{collaboration/collaboration-comment
        comment=comment
        isFirstComment=isFirstComment
      }}`);
    });

    it('does not show "Resolve" button', async function() {
      const comment = make('comment', 'fromReviewThread');
      this.setProperties({comment});

      expect(CollaborationComment.resolveButton.isVisible).to.equal(false);
      expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
      await percySnapshot(this.test);
    });

    it('does not show "Archive" button', async function() {
      const comment = make('comment', 'fromNoteThread');
      this.setProperties({comment});

      expect(CollaborationComment.resolveButton.isVisible).to.equal(false);
      expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
      await percySnapshot(this.test);
    });

    it('does not show "Resolved" indicator', async function() {
      const comment = make('comment', 'fromResolvedThread');
      this.setProperties({comment});

      expect(CollaborationComment.isResolved).to.equal(false);
      expect(CollaborationComment.isArchived).to.equal(false);
    });

    it('does not show "Archived" indicator', async function() {
      const comment = make('comment', 'fromArchivedThread');
      this.setProperties({comment});

      expect(CollaborationComment.isResolved).to.equal(false);
      expect(CollaborationComment.isArchived).to.equal(false);
    });
  });
});
