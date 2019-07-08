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
        isCommentingAllowed: true,
      });
      await this.render(hbs`{{collaboration/collaboration-comment
        comment=comment
        isFirstComment=isFirstComment
        closeCommentThread=closeCommentThreadStub
        isCommentingAllowed=isCommentingAllowed
      }}`);
    });

    describe('when the comment thread is open', function() {
      describe('when isResolvable is true', function() {
        beforeEach(function() {
          const comment = make('comment', 'fromReviewThread');
          this.setProperties({comment});
        });

        it('shows "Resolve" button when isResolvable is true', async function() {
          expect(CollaborationComment.resolveButton.isVisible).to.equal(true);
          expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
          await percySnapshot(this.test);
        });

        it('does not show "Resolve" button when isCommentingAllowed is false', async function() {
          this.setProperties({isCommentingAllowed: false});

          expect(CollaborationComment.resolveButton.isVisible).to.equal(false);
          expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
        });
      });

      describe('when isResolvable is false', function() {
        beforeEach(function() {
          const comment = make('comment', 'fromNoteThread');
          this.setProperties({comment});
        });

        it('shows "Archive" button when isResolvable is false', async function() {
          expect(CollaborationComment.resolveButton.isVisible).to.equal(false);
          expect(CollaborationComment.archiveButton.isVisible).to.equal(true);
          await percySnapshot(this.test);
        });

        it('does not show "Resolve" button when isCommentingAllowed is false', async function() {
          this.setProperties({isCommentingAllowed: false});

          expect(CollaborationComment.resolveButton.isVisible).to.equal(false);
          expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
        });
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
      describe('when comment is from a "request changes" thread', function() {
        let comment;
        beforeEach(async function() {
          comment = make('comment', 'fromReviewThread');
          this.setProperties({comment});
        });

        it('sends close action with correct args', async function() {
          await CollaborationComment.resolveButton.click();
          expect(closeCommentThreadStub).to.have.been.calledWith({
            commentThread: comment.commentThread,
          });
        });

        it('shows flash message if save fails', async function() {
          closeCommentThreadStub.returns({isSuccessful: false});
          const flashMessageService = this.owner
            .lookup('service:flash-messages')
            .registerTypes(['danger']);
          sinon.stub(flashMessageService, 'danger');
          await CollaborationComment.resolveButton.click();
          expect(flashMessageService.danger).to.have.been.called;
        });
      });

      describe('when comment is from a "note" thread', function() {
        let comment;
        beforeEach(async function() {
          comment = make('comment', 'fromNoteThread');
          this.setProperties({comment});
        });

        it('sends close action with correct args', async function() {
          await CollaborationComment.archiveButton.click();
          expect(closeCommentThreadStub).to.have.been.calledWith({
            commentThread: comment.commentThread,
          });
        });

        it('shows flash message if save fails', async function() {
          closeCommentThreadStub.returns({isSuccessful: false});
          const flashMessageService = this.owner
            .lookup('service:flash-messages')
            .registerTypes(['danger']);
          sinon.stub(flashMessageService, 'danger');
          await CollaborationComment.archiveButton.click();
          expect(flashMessageService.danger).to.have.been.called;
        });
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

    it('preserves new lines and html', async function() {
      const comment = make('comment', {
        body: `hello

            new lines

            new lines again.
            <a href="some html"></a>
           `,
      });
      this.setProperties({comment});

      await percySnapshot(this.test);
    });
  });
});
