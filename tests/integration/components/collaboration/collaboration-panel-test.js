import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import CollaborationPanel from 'percy-web/tests/pages/components/collaboration/collaboration-panel';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

describe('Integration: CollaborationPanel', function() {
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
    it('displays comment threads', async function() {
      const commentThreads = makeList('comment-thread', 2, 'withTwoComments');
      this.setProperties({commentThreads});
      await this.render(hbs`{{collaboration/collaboration-panel
        commentThreads=commentThreads
      }}`);

      expect(CollaborationPanel.newComment.isNewThreadButtonVisible).to.equal(true);
      expect(CollaborationPanel.newComment.isNewThreadContainerVisible).to.equal(false);
      expect(CollaborationPanel.commentThreads.length).to.equal(2);
      await percySnapshot(this.test);
    });
  });
});
