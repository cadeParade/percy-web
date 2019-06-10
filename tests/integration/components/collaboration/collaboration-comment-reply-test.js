import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import CommentReply from 'percy-web/tests/pages/components/collaboration/collaboration-comment-reply'; // eslint-disable-line
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import Service from '@ember/service';
import sinon from 'sinon';
import {initialize as initializeEmberKeyboard} from 'ember-keyboard';

describe('Integration: CollaborationCommentReply', function() {
  setupRenderingTest('collaboration-comment-reply', {
    integration: true,
  });

  beforeEach(async function() {
    setupFactoryGuy(this);
    CommentReply.setContext(this);

    const currentUser = make('user');
    const sessionServiceStub = Service.extend({currentUser});
    this.owner.register('service:session', sessionServiceStub, 'sessionService');
  });

  describe('when the reply is collapsed', function() {
    beforeEach(async function() {
      await this.render(hbs`{{collaboration/collaboration-comment-reply}}`);
    });

    it('shows collapsed reply textarea by default', async function() {
      expect(CommentReply.isCollapsed).to.equal(true);

      await percySnapshot(this.test);
    });

    it('expands when the textarea is focused', async function() {
      await CommentReply.expandTextarea();

      expect(CommentReply.isExpanded).to.equal(true);
    });
  });

  describe('when the reply is expanded', function() {
    let commentThread;
    let submitStub;
    beforeEach(async function() {
      initializeEmberKeyboard();
      commentThread = make('comment-thread');
      submitStub = sinon.stub().returns({isSuccessful: true});

      this.setProperties({commentThread, submitStub});
      await this.render(hbs`{{collaboration/collaboration-comment-reply
        commentThread=commentThread
        createComment=submitStub
      }}`);

      await CommentReply.expandTextarea();
    });

    it('submit button is disabled by default', async function() {
      expect(CommentReply.submit.isDisabled).to.equal(true);
      await percySnapshot(this.test);
    });

    it('submit button is enabled when comment body is not empty', async function() {
      await CommentReply.typeComment('hi there');
      expect(CommentReply.submit.isDisabled).to.equal(false);
      await percySnapshot(this.test);
    });

    it('collapses reply when cancel button is clicked', async function() {
      expect(CommentReply.isCollapsed).to.equal(false);
      await CommentReply.cancel.click();
      expect(CommentReply.isCollapsed).to.equal(true);
    });

    it('collapses reply when Escape is pressed', async function() {
      expect(CommentReply.isCollapsed).to.equal(false);
      await CommentReply.percyTextarea.escape();
      expect(CommentReply.isCollapsed).to.equal(true);
    });

    it('sends `saveReply` with correct args when sumit is clicked', async function() {
      const commentText = 'When you play the game of thrones, you win or you die';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();

      expect(submitStub).to.have.been.calledWith({
        commentThread,
        commentBody: commentText,
      });
    });

    it('sends `saveReply` with correct args when cmd+Enter is pressed', async function() {
      const commentText = 'hello there';
      await CommentReply.typeComment(commentText);
      await CommentReply.percyTextarea.cmdEnter();
      expect(submitStub).to.have.been.calledWith({
        commentThread,
        commentBody: commentText,
      });
    });

    it('shows saving indicator when saving', async function() {
      submitStub.returns({isRunning: true});
      const commentText = 'When you play the game of thrones, you win or you die';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();
      expect(CommentReply.submit.isLoading).to.equal(true);
      await percySnapshot(this.test);
    });

    it('resets reply when comment is successfully saved', async function() {
      submitStub.returns({isSuccessful: true});
      const commentText = 'That’s what I do: I drink and I know things.';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();

      expect(CommentReply.isCollapsed).to.equal(true);
      expect(CommentReply.commentText).to.equal('');
    });

    it('shows flash message when comment save fails', async function() {
      const flashMessageService = this.owner
        .lookup('service:flash-messages')
        .registerTypes(['danger']);
      sinon.stub(flashMessageService, 'danger');

      submitStub.returns({isSuccessful: false});
      const commentText = 'That’s what I do: I drink and I know things.';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();

      expect(flashMessageService.danger).to.have.been.called;
      expect(CommentReply.isCollapsed).to.equal(false);
      expect(CommentReply.commentText).to.equal(commentText);
    });
  });
});
