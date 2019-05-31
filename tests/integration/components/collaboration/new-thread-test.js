import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import CollaborationNewThread from 'percy-web/tests/pages/components/collaboration/new-thread';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

describe('Integration: CollaborationNewThread', function() {
  setupRenderingTest('collaboration-new-thread', {
    integration: true,
  });

  beforeEach(async function() {
    setupFactoryGuy(this);
    CollaborationNewThread.setContext(this);
  });

  describe('when shouldShowNewCommentInput is true', function() {
    let user;
    let saveStub;

    beforeEach(async function() {
      user = make('user');
      saveStub = sinon.stub();
      this.setProperties({user, saveStub});

      await this.render(hbs`{{collaboration/new-thread
        currentUser=user
        createCommentThread=saveStub
        shouldShowNewCommentInput=true
      }}`);
    });

    it('allows typing in textarea', async function() {
      const commentText = 'I will take what is mine with fire and blood.';
      expect(CollaborationNewThread.isSubmitDisabled).to.equal(true);
      await CollaborationNewThread.typeNewComment(commentText);

      expect(CollaborationNewThread.textareaValue).to.equal(commentText);
      expect(CollaborationNewThread.isSubmitDisabled).to.equal(false);

      await percySnapshot(this.test);
    });

    it('sends save action with correct args when "request changes" is not checked', async function() { // eslint-disable-line
      const commentText = 'I am not here to be queen of the ashes';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.submitNewThread();

      expect(saveStub).to.have.been.calledWith({
        commentBody: commentText,
        areChangesRequested: false,
      });
    });

    it('sends save action with correct args when "request changes" is checked', async function() { // eslint-disable-line
      const commentText = 'I am not here to be queen of the ashes';
      await CollaborationNewThread.typeNewComment(commentText);
      await CollaborationNewThread.checkRequestChangesBox();
      await CollaborationNewThread.submitNewThread();

      expect(saveStub).to.have.been.calledWith({
        commentBody: commentText,
        areChangesRequested: true,
      });
    });

    it('can back out of comment adding', async function() {
      await CollaborationNewThread.cancelNewThread();
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
      await this.render(hbs`{{collaboration/new-thread
        currentUser=user
        shouldShowNewCommentInput=false
      }}`);
    });

    it('displays new comment button', async function() {
      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationNewThread.isNewThreadContainerVisible).to.equal(false);
      await percySnapshot(this.test);
    });

    it('shows new comment textarea when the button is clicked', async function() {
      await CollaborationNewThread.clickNewThreadButton();

      expect(CollaborationNewThread.isNewThreadButtonVisible).to.equal(false);
      expect(CollaborationNewThread.isNewThreadContainerVisible).to.equal(true);
      await percySnapshot(this.test);
    });
  });
});
