import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import CollaborationComment from 'percy-web/tests/pages/components/collaboration/collaboration-comment'; // eslint-disable-line
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';
import stubService from 'percy-web/tests/helpers/stub-service-integration';

describe('Integration: CollaborationComment', function () {
  setupRenderingTest('collaboration-comment', {
    integration: true,
  });

  function stubCloseComment(context, stub) {
    const service = context.owner.lookup('service:comment-threads');
    service.set('closeCommentThread', {perform: stub});
  }

  let closeCommentThreadStub;

  beforeEach(async function () {
    setupFactoryGuy(this);

    closeCommentThreadStub = sinon.stub().resolves();
    stubService(this, 'commentThreads', 'comment-threads', {
      closeCommentThread: {perform: closeCommentThreadStub},
    });
  });

  describe('when `isFirstComment` is true', function () {
    beforeEach(async function () {
      const comment = make('comment', 'fromReviewThread');
      this.setProperties({
        isFirstComment: true,
        comment,
        isCommentingAllowed: true,
      });
      await render(hbs`<Collaboration::CollaborationComment
        @comment={{comment}}
        @isFirstComment={{isFirstComment}}
        @isCommentingAllowed={{isCommentingAllowed}}
      />`);
    });

    describe('when the comment thread is open', function () {
      it('shows "Archive" button', async function () {
        expect(CollaborationComment.archiveButton.isVisible).to.equal(true);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('does not show "Archive" button when isCommentingAllowed is false', async function () {
        this.setProperties({isCommentingAllowed: false});

        expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
      });
    });

    describe('when the comment thread is closed', function () {
      it('shows "Archived" indication when comment thread is closed', async function () {
        const comment = make('comment', 'fromArchivedThread');
        this.setProperties({comment});

        expect(CollaborationComment.isArchived).to.equal(true);
        await percySnapshot(this.test, {darkMode: true});
      });
    });

    describe('closing a comment', function () {
      describe('when comment is from a "request changes" thread', function () {
        let comment;
        beforeEach(async function () {
          comment = make('comment', 'fromReviewThread');
          this.setProperties({comment});
        });

        it('sends close action with correct args', async function () {
          await CollaborationComment.close();
          expect(closeCommentThreadStub).to.have.been.calledWith({
            commentThread: comment.commentThread,
          });
        });

        it('shows flash message if save fails', async function () {
          const closeCommentThreadStub = sinon.stub().returns({isSuccessful: false});
          stubCloseComment(this, closeCommentThreadStub);
          const flashMessageService = this.owner
            .lookup('service:flash-messages')
            .registerTypes(['danger']);
          sinon.stub(flashMessageService, 'danger');
          await CollaborationComment.close();
          expect(flashMessageService.danger).to.have.been.called;
        });
      });

      describe('when comment is from a "note" thread', function () {
        let comment;
        beforeEach(async function () {
          comment = make('comment', 'fromNoteThread');
          this.setProperties({comment});
        });

        it('sends close action with correct args', async function () {
          await CollaborationComment.close();
          expect(closeCommentThreadStub).to.have.been.calledWith({
            commentThread: comment.commentThread,
          });
        });

        it('shows flash message if save fails', async function () {
          const closeCommentThreadStub = sinon.stub().returns({isSuccessful: false});
          stubCloseComment(this, closeCommentThreadStub);

          const flashMessageService = this.owner
            .lookup('service:flash-messages')
            .registerTypes(['danger']);
          sinon.stub(flashMessageService, 'danger');
          await CollaborationComment.close();
          expect(flashMessageService.danger).to.have.been.called;
        });
      });
    });
  });

  describe('when `isFirstComment` is false', function () {
    beforeEach(async function () {
      this.setProperties({isFirstComment: false, comment: {}});
      await render(hbs`<Collaboration::CollaborationComment
        @comment={{comment}}
        @isFirstComment={{isFirstComment}}
      />`);
    });

    it('does not show "Archive" button', async function () {
      const comment = make('comment', 'fromNoteThread');
      this.setProperties({comment});

      expect(CollaborationComment.archiveButton.isVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('does not show "Archived" indicator', async function () {
      const comment = make('comment', 'fromArchivedThread');
      this.setProperties({comment});

      expect(CollaborationComment.isArchived).to.equal(false);
    });

    it('preserves new lines and html', async function () {
      const comment = make('comment', {
        body: `hello

            new lines

            new lines again.
            <a href="some html"></a>
           `,
      });
      this.setProperties({comment});

      await percySnapshot(this.test, {darkMode: true});
    });
  });
});
