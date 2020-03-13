import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import CommentReply from 'percy-web/tests/pages/components/collaboration/collaboration-comment-reply'; // eslint-disable-line
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import Service from '@ember/service';
import sinon from 'sinon';
import {initialize as initializeEmberKeyboard} from 'ember-keyboard';
import {fillIn, render} from '@ember/test-helpers';
import stubService from 'percy-web/tests/helpers/stub-service-integration';

describe('Integration: CollaborationCommentReply', function() {
  setupRenderingTest('collaboration-comment-reply', {
    integration: true,
  });

  function stubCreateComment(context, stub) {
    const service = context.owner.lookup('service:comment-threads');
    service.set('createComment', {perform: stub});
  }

  let createCommentStub;

  beforeEach(async function() {
    setupFactoryGuy(this);

    createCommentStub = sinon.stub().resolves();
    stubService(this, 'commentThreads', 'comment-threads', {
      createComment: {perform: createCommentStub},
    });

    const currentUser = make('user');
    const sessionServiceStub = Service.extend({currentUser});
    this.owner.register('service:session', sessionServiceStub, 'sessionService');
  });

  describe('when the reply is collapsed', function() {
    beforeEach(async function() {
      await render(hbs`<Collaboration::CollaborationCommentReply />`);
    });

    it('shows collapsed reply textarea by default', async function() {
      expect(CommentReply.isCollapsed).to.equal(true);

      await percySnapshot(this.test, {darkMode: true});
    });

    it('expands when the textarea is focused', async function() {
      await CommentReply.expandTextarea();

      expect(CommentReply.isExpanded).to.equal(true);
    });
  });

  describe('when the reply is expanded', function() {
    let commentThread;

    beforeEach(async function() {
      initializeEmberKeyboard();
      const organization = make('organization', 'withUsers');
      const project = make('project', {organization});
      const build = make('build', {project});
      const snapshot = make('snapshot', {build});
      commentThread = make('comment-thread', {snapshot});

      this.setProperties({commentThread, organization});
      await render(hbs`<Collaboration::CollaborationCommentReply
        @commentThread={{commentThread}}
      />`);

      await CommentReply.expandTextarea();
    });

    it('submit button is disabled by default', async function() {
      expect(CommentReply.submit.isDisabled).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('submit button is enabled when comment body is not empty', async function() {
      await CommentReply.typeComment('hi there');
      expect(CommentReply.submit.isDisabled).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
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

    it('sends `saveReply` with correct args when submit is clicked', async function() {
      const commentText = 'When you play the game of thrones, you win or you die';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();

      expect(createCommentStub).to.have.been.calledWith({
        commentThread,
        commentBody: commentText,
        mentionedUsers: [],
      });
    });

    it('sends `saveReply` with correct args when cmd+Enter is pressed', async function() {
      const commentText = 'hello there';
      await CommentReply.typeComment(commentText);
      await CommentReply.percyTextarea.cmdEnter();
      expect(createCommentStub).to.have.been.calledWith({
        commentThread,
        commentBody: commentText,
        mentionedUsers: [],
      });
    });

    it('sends `saveReply` with correct args when @mentioning users', async function() {
      const orgUsers = this.organization.organizationUsers.mapBy('user').sortBy('name');
      const commentText = 'hello there';
      await CommentReply.typeComment(commentText);
      await CommentReply.mentionableTextarea.selectFirstUser();
      await CommentReply.mentionableTextarea.selectSecondUser();
      await CommentReply.percyTextarea.cmdEnter();

      expect(createCommentStub).to.have.been.calledWith({
        commentThread,
        commentBody: `${commentText}@${orgUsers[0].name} @${orgUsers[1].name} `,
        mentionedUsers: [orgUsers[0], orgUsers[1]],
      });
    });

    // eslint-disable-next-line
    it('sends `saveReply` with correct args when @mentioning users and they are removed', async function() {
      // This test @mentions two users, then overwrites the text in the input with something else.
      // In this case, since the users are no longer present in the text of the comment, we would
      // not want the user data to actually be sent with the payload of the request.
      const commentText = 'hello there';
      await CommentReply.typeComment(commentText);
      await CommentReply.mentionableTextarea.selectFirstUser();
      await CommentReply.mentionableTextarea.selectSecondUser();

      await fillIn('textarea', commentText);
      await CommentReply.percyTextarea.cmdEnter();

      expect(createCommentStub).to.have.been.calledWith({
        commentThread,
        commentBody: commentText,
        mentionedUsers: [],
      });
    });

    it('shows saving indicator when saving', async function() {
      const createCommentStub = sinon.stub().returns({isRunning: true});
      stubCreateComment(this, createCommentStub);
      const commentText = 'When you play the game of thrones, you win or you die';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();
      expect(CommentReply.submit.isLoading).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('resets reply when comment is successfully saved', async function() {
      const createCommentStub = sinon.stub().returns({isSuccessful: true});
      stubCreateComment(this, createCommentStub);
      const commentText = 'That’s what I do: I drink and I know things.';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();

      expect(CommentReply.isCollapsed).to.equal(true);
      expect(CommentReply.commentText).to.equal('');
    });

    it('shows flash message when comment save fails', async function() {
      const createCommentStub = sinon.stub().returns({isSuccessful: false});
      stubCreateComment(this, createCommentStub);

      const flashMessageService = this.owner
        .lookup('service:flash-messages')
        .registerTypes(['danger']);
      sinon.stub(flashMessageService, 'danger');

      const commentText = 'That’s what I do: I drink and I know things.';
      await CommentReply.typeComment(commentText);
      await CommentReply.submit.click();

      expect(flashMessageService.danger).to.have.been.called;
      expect(CommentReply.isCollapsed).to.equal(false);
      expect(CommentReply.commentText).to.equal(commentText);
    });
  });
});
