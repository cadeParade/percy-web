import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import CommentThread from 'percy-web/tests/pages/components/collaboration/comment-thread';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import Service from '@ember/service';
import {render} from '@ember/test-helpers';

describe('Integration: CommentThread', function() {
  setupRenderingTest('comment-thread', {
    integration: true,
  });

  beforeEach(async function() {
    setupFactoryGuy(this);

    const currentUser = make('user');
    const sessionServiceStub = Service.extend({currentUser});
    this.owner.register('service:session', sessionServiceStub, 'sessionService');
  });

  describe('when thread is open', function() {
    describe('when there are less than 4 comments in thread', function() {
      it('displays correctly with one comment', async function() {
        const commentThread = make('comment-thread', 'note', 'withOneComment');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);

        expect(CommentThread.comments.length).to.equal(1);
        expect(CommentThread.reply.isVisible).to.equal(true);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('displays correctly with two comments', async function() {
        const commentThread = make('comment-thread', 'note', 'withTwoComments');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);

        expect(CommentThread.comments.length).to.equal(2);
        expect(CommentThread.reply.isVisible).to.equal(true);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('expands reply input when clicked', async function() {
        const commentThread = make('comment-thread', 'note', 'withOneComment');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);
        await CommentThread.focusReply();
        await percySnapshot(this.test, {darkMode: true});
      });

      it('does not display reply box when `isCommentingAllowed` is false', async function() {
        const commentThread = make('comment-thread', 'note', 'withOneComment');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
          isCommentingAllowed=false
        }}`);
        expect(CommentThread.reply.isVisible).to.equal(false);
      });
    });

    describe('when there are more than four comments in thread', function() {
      beforeEach(async function() {
        const commentThread = make('comment-thread', 'note', 'withTenComments');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);
      });

      it('displays correctly', async function() {
        expect(CommentThread.comments.length).to.equal(3);
        expect(CommentThread.expandComments.collapsedCommentCount).to.include(7);
        expect(CommentThread.reply.isVisible).to.equal(true);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('expands collapsed comments when "Show additional comments" is clicked', async function() {
        await CommentThread.expandComments.click();
        expect(CommentThread.comments.length).to.equal(10);
        expect(CommentThread.reply.isVisible).to.equal(true);
      });
    });
  });

  describe('when thread is closed', function() {
    describe('when there are less than four comments in the thread', function() {
      it('displays correctly with one comment', async function() {
        const commentThread = make('comment-thread', 'withOneComment', 'closed');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);

        expect(CommentThread.comments.length).to.equal(1);
        expect(CommentThread.reply.isVisible).to.equal(false);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('displays correctly with two comments', async function() {
        const commentThread = make('comment-thread', 'withTwoComments', 'closed');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);

        expect(CommentThread.comments.length).to.equal(2);
        expect(CommentThread.reply.isVisible).to.equal(false);
        await percySnapshot(this.test, {darkMode: true});
      });
    });

    describe('when there are more than four comments in thread', function() {
      beforeEach(async function() {
        const commentThread = make('comment-thread', 'withTenComments', 'closed');
        this.setProperties({commentThread});
        await render(hbs`{{collaboration/comment-thread
          commentThread=commentThread
        }}`);
      });

      it('displays correctly', async function() {
        expect(CommentThread.comments.length).to.equal(3);
        expect(CommentThread.expandComments.collapsedCommentCount).to.include('View conversation');
        expect(CommentThread.reply.isVisible).to.equal(false);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('expands collapsed comments when "View conversation" is clicked', async function() {
        await CommentThread.expandComments.click();
        expect(CommentThread.comments.length).to.equal(10);
        expect(CommentThread.reply.isVisible).to.equal(false);
      });
    });
  });
});
