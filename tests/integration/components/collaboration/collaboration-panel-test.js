import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import CollaborationPanel from 'percy-web/tests/pages/components/collaboration/collaboration-panel';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import moment from 'moment';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';
import {render} from '@ember/test-helpers';

describe('Integration: CollaborationPanel', function() {
  freezeMoment('2018-12-17');

  setupRenderingTest('collaboration-panel', {
    integration: true,
  });

  beforeEach(async function() {
    setupFactoryGuy(this);
    CollaborationPanel.setContext(this);
  });

  describe('when there are no comment threads', function() {
    let user;
    let saveStub;

    beforeEach(async function() {
      user = make('user');
      const commentThreads = [];
      const isCommentingAllowed = true;
      this.setProperties({commentThreads, user, saveStub, isCommentingAllowed});

      await render(hbs`{{collaboration/collaboration-panel
        commentThreads=commentThreads
        isCommentingAllowed=isCommentingAllowed
      }}`);
    });

    it('shows "New Comment" textarea by default', async function() {
      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(false);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(true);
      expect(CollaborationPanel.newComment.isSubmitDisabled).to.equal(true);
      expect(CollaborationPanel.commentThreads.length).to.equal(0);
      await percySnapshot(this.test);
    });

    it('does not show "New Comment" textarea when isCommentingAllowed is false', async function() {
      this.set('isCommentingAllowed', false);
      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(false);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(false);
      expect(CollaborationPanel.commentThreads.length).to.equal(0);
    });
  });

  describe('when there are comment threads', function() {
    it('displays comment threads in correct order', async function() {
      const oldOpenCommentThread = make('comment-thread', 'old');
      const newOpenCommentThread = make('comment-thread', 'withTwoComments', {
        createdAt: moment().subtract(1, 'hours'),
      });
      const oldClosedCommentThread = make('comment-thread', 'old', 'closed');
      const newClosedCommentThread = make('comment-thread', 'withTwoComments', 'closed', {
        createdAt: moment().subtract(1, 'hours'),
      });

      const commentThreads = [
        oldClosedCommentThread,
        oldOpenCommentThread,
        newClosedCommentThread,
        newOpenCommentThread,
      ];

      this.setProperties({commentThreads});
      await render(hbs`{{collaboration/collaboration-panel
        commentThreads=commentThreads
      }}`);

      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(false);
      expect(CollaborationPanel.commentThreads.length).to.equal(2);

      expect(CollaborationPanel.commentThreads[0].comments[0].createdAt).to.equal('a day ago');
      expect(CollaborationPanel.commentThreads[0].isClosed).to.equal(false);
      await percySnapshot(this.test.fullTitle() + 'before closed threads are expanded');

      await CollaborationPanel.showArchivedComments();
      expect(CollaborationPanel.commentThreads.length).to.equal(4);
      expect(CollaborationPanel.commentThreads[2].comments[0].createdAt).to.equal('a day ago');
      expect(CollaborationPanel.commentThreads[2].isClosed).to.equal(true);
      await percySnapshot(this.test.fullTitle() + 'after closed threads are expanded');
    });

    it('does not show "New Comment" button when isCommentingAllowed is false', async function() {
      this.set('commentThreads', makeList('comment-thread', 2, 'withOneComment'));
      await render(hbs`{{collaboration/collaboration-panel
        commentThreads=commentThreads
        isCommentingAllowed=false
      }}`);

      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(false);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(false);
      expect(CollaborationPanel.commentThreads.length).to.equal(2);
    });
  });
});
