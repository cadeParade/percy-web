import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import CollaborationNewThread from 'percy-web/tests/pages/components/collaboration/new-thread';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render, fillIn} from '@ember/test-helpers';

describe('Integration: CollaborationNewThread', function() {
  setupRenderingTest('collaboration-new-thread', {
    integration: true,
  });

  beforeEach(async function() {
    setupFactoryGuy(this);
  });

  describe('when shouldShowNewCommentInput is true', function() {
    let user;
    let saveStub;
    let snapshot;

    beforeEach(async function() {
      const organization = make('organization', 'withUsers');
      const project = make('project', {organization});
      const build = make('build', {project});
      snapshot = make('snapshot', {build});
      user = make('user');
      saveStub = sinon.stub().returns({isSuccessful: true});

      this.setProperties({user, saveStub, snapshot, organization});

      await render(hbs`<Collaboration::NewThread
        @currentUser={{user}}
        @createCommentThread={{saveStub}}
        @shouldShowNewCommentInput={{true}}
        @snapshot={{snapshot}}
      />`);
    });

    it('allows typing in textarea', async function() {
      const commentText = 'I will take what is mine with fire and blood.';
      expect(CollaborationNewThread.isSubmitDisabled).to.equal(true);
      await CollaborationNewThread.typeNewComment(commentText);

      expect(CollaborationNewThread.textareaValue).to.equal(commentText);
      expect(CollaborationNewThread.isSubmitDisabled).to.equal(false);

      await percySnapshot(this.test, {darkMode: true});
    });

    it('sends save action with correct args when "request changes" is not checked', async function() { // eslint-disable-line
      const commentText = 'I am not here to be queen of the ashes';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.submitNewThread();

      expect(saveStub).to.have.been.calledWith({
        snapshotId: snapshot.id,
        commentBody: commentText,
        areChangesRequested: false,
        mentionedUsers: [],
      });
    });

    it('sends save action with correct args when "request changes" is checked', async function() { // eslint-disable-line
      const commentText = 'I am not here to be queen of the ashes';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.checkRequestChangesBox();
      await CollaborationNewThread.submitNewThread();

      expect(saveStub).to.have.been.calledWith({
        snapshotId: snapshot.id,
        commentBody: commentText,
        areChangesRequested: true,
        mentionedUsers: [],
      });
    });

    it('sends save action with correct args when @mentioning users', async function() {
      const orgUsers = this.organization.organizationUsers.mapBy('user').sortBy('name');
      const commentText = 'hello there';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.mentionableTextarea.selectFirstUser();
      await CollaborationNewThread.mentionableTextarea.selectSecondUser();
      await CollaborationNewThread.percyTextarea.cmdEnter();

      expect(saveStub).to.have.been.calledWith({
        snapshotId: snapshot.id,
        areChangesRequested: false,
        commentBody: `${commentText}@${orgUsers[0].name} @${orgUsers[1].name} `,
        mentionedUsers: [orgUsers[0], orgUsers[1]],
      });
    });

    // eslint-disable-next-line
    it('sends save action with correct args when @mentioning users and they are removed', async function() {
      // This test @mentions two users, then overwrites the text in the input with something else.
      // In this case, since the users are no longer present in the text of the comment, we would
      // not want the user data to actually be sent with the payload of the request.
      const commentText = 'hello there';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.mentionableTextarea.selectFirstUser();
      await CollaborationNewThread.mentionableTextarea.selectSecondUser();

      await fillIn('textarea', commentText);
      await CollaborationNewThread.percyTextarea.cmdEnter();

      expect(saveStub).to.have.been.calledWith({
        snapshotId: snapshot.id,
        areChangesRequested: false,
        commentBody: commentText,
        mentionedUsers: [],
      });
    });

    it('sends save action with correct args when cmd+Enter is pressed', async function() {
      const commentText = 'What happened the white horse?';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.checkRequestChangesBox();
      await CollaborationNewThread.percyTextarea.cmdEnter();
      expect(saveStub).to.have.been.calledWith({
        snapshotId: snapshot.id,
        commentBody: commentText,
        areChangesRequested: true,
        mentionedUsers: [],
      });
    });

    it('disables "Request changes" checkbox when snapshot is approved', async function() {
      const snapshot = make('snapshot', 'approved');
      this.setProperties({snapshot});
      expect(CollaborationNewThread.isRequestChangesDisabled).to.equal(true);
      await CollaborationNewThread.checkRequestChangesBox();
      expect(CollaborationNewThread.isRequestChangesChecked).to.equal(false);
    });

    it('can back out of comment adding by clicking "Cancel"', async function() {
      await CollaborationNewThread.cancelNewThread();
      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationNewThread.isNewThreadContainerVisible).to.equal(false);
    });

    it('can back out of comment adding by typing "Escape"', async function() {
      await CollaborationNewThread.percyTextarea.escape();
      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationNewThread.isNewThreadContainerVisible).to.equal(false);
    });

    it('resets form after comment thread is saved successfully', async function() {
      saveStub.returns({isSuccessful: true});
      const commentText = 'What do we say to the god of death? Not today.';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.checkRequestChangesBox();
      await CollaborationNewThread.submitNewThread();

      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(true);
      await CollaborationNewThread.clickNewThreadButton();

      expect(CollaborationNewThread.isRequestChangesChecked).to.equal(false);
      expect(CollaborationNewThread.textareaValue).to.equal('');
    });

    it('shows flash message after comment thread save errors', async function() {
      saveStub.returns({isSuccessful: false});
      const flashMessageService = this.owner
        .lookup('service:flash-messages')
        .registerTypes(['danger']);
      sinon.stub(flashMessageService, 'danger');

      const commentText = 'What do we say to the god of death? Not today.';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.checkRequestChangesBox();
      await CollaborationNewThread.submitNewThread();

      expect(flashMessageService.danger).to.have.been.called;
      expect(CollaborationNewThread.textareaValue).to.equal(commentText);
      expect(CollaborationNewThread.isRequestChangesChecked).to.equal(true);
    });
  });

  describe('when shouldShowNewCommentInput is false', function() {
    beforeEach(async function() {
      this.setProperties({user: make('user')});
      await render(hbs`<Collaboration::NewThread
        @currentUser={{user}}
        @shouldShowNewCommentInput={{false}}
      />`);
    });

    it('displays new comment button', async function() {
      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationNewThread.isNewThreadContainerVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('shows new comment textarea when the button is clicked', async function() {
      await CollaborationNewThread.clickNewThreadButton();

      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(false);
      expect(CollaborationNewThread.isNewThreadContainerVisible).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});
    });
  });
});
