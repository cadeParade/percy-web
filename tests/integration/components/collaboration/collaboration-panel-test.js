import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import CollaborationPanel from 'percy-web/tests/pages/components/collaboration/collaboration-panel';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import moment from 'moment';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';

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
      this.setProperties({commentThreads, user, saveStub});

      await this.render(hbs`{{collaboration/collaboration-panel
        commentThreads=commentThreads
      }}`);
    });

    it('shows "New Comment" textarea by default', async function() {
      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(false);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(true);
      expect(CollaborationPanel.newComment.isSubmitDisabled).to.equal(true);
      expect(CollaborationPanel.commentThreads.length).to.equal(0);
      await percySnapshot(this.test);
    });
  });

  describe('when there are comment threads', function() {
    it('displays comment threads in correct order', async function() {
      const oldCommentThread = make('comment-thread', 'old', {
        createdAt: moment().subtract(100, 'days'),
      });
      const newCommentThread = make('comment-thread', 'withTwoComments', {
        createdAt: moment().subtract(1, 'hours'),
      });

      const commentThreads = [oldCommentThread, newCommentThread];
      this.setProperties({commentThreads});
      await this.render(hbs`{{collaboration/collaboration-panel
        commentThreads=commentThreads
      }}`);

      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(false);
      expect(CollaborationPanel.commentThreads.length).to.equal(2);
      expect(CollaborationPanel.commentThreads[0].comments[0].createdAt).to.equal('a day ago');
    });
  });
});
