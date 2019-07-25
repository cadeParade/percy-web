/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import SnapshotViewer from 'percy-web/tests/pages/components/snapshot-viewer';
import {resolve} from 'rsvp';
import {SNAPSHOT_APPROVED_STATE, SNAPSHOT_UNAPPROVED_STATE} from 'percy-web/models/snapshot';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import faker from 'faker';

describe('Integration: SnapshotViewer', function() {
  setupRenderingTest('snapshot-viewer', {
    integration: true,
  });

  let snapshotTitle;
  let showSnapshotFullModalTriggeredStub;
  let snapshot;
  let createReviewStub;

  beforeEach(function() {
    setupFactoryGuy(this);
    SnapshotViewer.setContext(this);

    showSnapshotFullModalTriggeredStub = sinon.stub();
    createReviewStub = sinon.stub().returns(resolve());
    snapshotTitle = 'Awesome snapshot title';
    snapshot = make('snapshot', 'withComparisons', {name: snapshotTitle});
    const build = make('build', 'finished');
    const browser = make('browser');
    build.set('snapshots', [snapshot]);
    const stub = sinon.stub();

    this.setProperties({
      stub,
      snapshot,
      build,
      browser,
      userSelectedWidth: null,
      showSnapshotFullModalTriggered: showSnapshotFullModalTriggeredStub,
      createReview: createReviewStub,
      isBuildApprovable: true,
    });
  });

  it('displays snapshot name', async function() {
    await this.render(hbs`{{snapshot-viewer
      snapshot=snapshot
      build=build
      showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
      userSelectedWidth=userSelectedWidth
      createReview=createReview
      activeBrowser=browser
      isBuildApprovable=isBuildApprovable
    }}`);

    expect(SnapshotViewer.header.isTitleVisible, 'title should be visible').to.equal(true);

    expect(SnapshotViewer.header.titleText, 'title text should be correct').to.equal(snapshotTitle);
  });

  it('compares visually to previous screenshot', async function() {
    await this.render(hbs`{{snapshot-viewer
      snapshot=snapshot
      build=build
      showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
      userSelectedWidth=userSelectedWidth
      activeBrowser=browser
      createReview=createReview
      isBuildApprovable=isBuildApprovable
    }}`);

    await percySnapshot(this.test);
  });

  describe('comparison mode switcher', function() {
    beforeEach(async function() {
      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        userSelectedWidth=userSelectedWidth
        activeBrowser=browser
        createReview=createReview
        isBuildApprovable=isBuildApprovable
      }}`);
    });

    it('does not display', async function() {
      expect(
        SnapshotViewer.header.isComparisonModeSwitcherVisible,
        'comparison mode switcher should not be visible',
      ).to.equal(false);
    });
  });

  describe('width switcher', function() {
    beforeEach(async function() {
      // set the widest width comparison to have no diffs to have interesting test behavior.
      this.get('snapshot.comparisons')
        .findBy('width', 1024)
        .set('diffRatio', 0);
    });

    it('shows widest width with diff as active by default when some comparisons have diffs', async function() { // eslint-disable-line

      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        userSelectedWidth=userSelectedWidth
        activeBrowser=browser
        createReview=createReview
        isBuildApprovable=isBuildApprovable
      }}`);

      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(true);
    });

    it('shows widest width with diff as active by default when no comparisons have diffs', async function() { // eslint-disable-line
      const snapshot = make('snapshot', 'withNoDiffs');
      this.set('snapshot', snapshot);

      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        userSelectedWidth=userSelectedWidth
        activeBrowser=browser
        createReview=createReview
        isBuildApprovable=isBuildApprovable
      }}`);

      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(false);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(true);
    });

    it('updates active button when clicked', async function() {
      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        userSelectedWidth=userSelectedWidth
        createReview=createReview
        activeBrowser=browser
        updateActiveSnapshotBlockId=stub
        isBuildApprovable=isBuildApprovable
      }}`);

      await SnapshotViewer.header.widthSwitcher.buttons.objectAt(0).click();
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(true);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(false);

      await SnapshotViewer.header.clickDropdownToggle();
      await SnapshotViewer.header.clickToggleAllWidths();
      await SnapshotViewer.header.widthSwitcher.buttons.objectAt(2).click();
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(false);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(true);

      await SnapshotViewer.header.widthSwitcher.buttons.objectAt(1).click();
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(true);
      expect(SnapshotViewer.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(false);
    });
  });

  describe('full screen toggle button', function() {
    beforeEach(async function() {
      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        userSelectedWidth=userSelectedWidth
        createReview=createReview
        updateActiveSnapshotBlockId=stub
        activeBrowser=browser
        isBuildApprovable=isBuildApprovable
      }}`);
    });

    it('displays', async function() {
      expect(SnapshotViewer.header.isFullScreenToggleVisible).to.equal(true);
    });

    it('sends closeSnapshotFullModal when toggle fullscreen button is clicked', async function() {
      const selectedWidth = snapshot.get('comparisons.firstObject.width');
      this.set('userSelectedWidth', selectedWidth);

      await SnapshotViewer.header.clickToggleFullscreen();
      expect(showSnapshotFullModalTriggeredStub).to.have.been.calledWith(
        this.get('snapshot.id'),
        selectedWidth,
      );
    });
  });

  describe('expand/collapse', function() {
    beforeEach(async function() {
      this.set('activeSnapshotBlockId', null);

      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        userSelectedWidth=userSelectedWidth
        createReview=createReview
        activeSnapshotBlockId=activeSnapshotBlockId
        updateActiveSnapshotBlockId=stub
        activeBrowser=browser
        isBuildApprovable=isBuildApprovable
      }}`);
    });

    it('is expanded by default when the snapshot is unapproved', async function() {
      this.set('snapshot.reviewState', SNAPSHOT_UNAPPROVED_STATE);
      expect(SnapshotViewer.isExpanded).to.equal(true);
    });

    it('is collapsed by default when the snapshot is approved', async function() {
      this.set('snapshot.reviewState', SNAPSHOT_APPROVED_STATE);
      expect(SnapshotViewer.isExpanded).to.equal(false);
    });

    it('is expanded when build is approved', async function() {
      this.set('snapshot.reviewState', SNAPSHOT_APPROVED_STATE);
      this.set('build.isApproved', true);

      expect(SnapshotViewer.isExpanded).to.equal(true);
    });

    it("is expanded when activeSnapshotBlockId is equal to the snapshot's id", async function() {
      this.set('snapshot.reviewState', SNAPSHOT_APPROVED_STATE);
      this.set('activeSnapshotBlockId', snapshot.get('id'));
      expect(SnapshotViewer.isExpanded).to.equal(true);
    });

    it('expands when the snapshot is collapsed and a user clicks the header ', async function() {
      this.set('snapshot.reviewState', SNAPSHOT_APPROVED_STATE);

      await SnapshotViewer.header.click();
      expect(SnapshotViewer.isExpanded).to.equal(true);
    });
  });

  describe('approve snapshot button', function() {
    beforeEach(async function() {
      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        createReview=createReview
        updateActiveSnapshotBlockId=stub
        activeBrowser=browser
        isBuildApprovable=isBuildApprovable
      }}`);
    });

    it('sends createReview with correct arguments when approve button is clicked', async function() { //eslint-disable-line
      await SnapshotViewer.header.clickApprove();
      expect(createReviewStub).to.have.been.calledWith([this.get('build.snapshots.firstObject')]);
    });

    it('does not display when build is not finished', async function() {
      this.set('build.state', 'pending');
      expect(SnapshotViewer.header.snapshotApprovalButton.isVisible).to.equal(false);
    });
  });

  describe('diff toggling', function() {
    beforeEach(async function() {
      await this.render(hbs`{{snapshot-viewer
        snapshot=snapshot
        build=build
        showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
        createReview=createReview
        updateActiveSnapshotBlockId=stub
        activeBrowser=browser
        isBuildApprovable=isBuildApprovable
      }}`);
    });

    it('toggles diff when clicking', async function() {
      expect(SnapshotViewer.isDiffImageVisible).to.equal(true);
      await SnapshotViewer.clickDiffImage();
      expect(SnapshotViewer.isDiffImageVisible).to.equal(false);
    });
  });

  describe('commenting', function() {
    describe('when there is a long comment', function() {
      beforeEach(async function() {
        const commentThread = make('comment-thread', {snapshot});
        make('comment', {
          body: 'sssssssssssssssssssssssssssssssssssssssssssssssssss' + faker.lorem.paragraph(50),
          commentThread,
        });
        await this.render(hbs`{{snapshot-viewer
          snapshot=snapshot
          build=build
          showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
          userSelectedWidth=userSelectedWidth
          createReview=createReview
          activeBrowser=browser
          isBuildApprovable=isBuildApprovable
          updateActiveSnapshotBlockId=stub
          createCommentThread=stub
        }}`);
      });

      it('displays correctly', async function() {
        await percySnapshot(this.test);
      });
    });

    describe('panel toggling', function() {
      describe('when there are no comments', function() {
        beforeEach(async function() {
          await this.render(hbs`{{snapshot-viewer
            snapshot=snapshot
            build=build
            showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
            userSelectedWidth=userSelectedWidth
            createReview=createReview
            activeBrowser=browser
            isBuildApprovable=isBuildApprovable
            updateActiveSnapshotBlockId=stub
            createCommentThread=stub
          }}`);
        });

        it('does not show panel by default', async function() {
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(false);
        });

        it('opens and closes sidebar when toggle button is clicked', async function() {
          await SnapshotViewer.header.toggleCommentSidebar();
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(true);
          await percySnapshot(this.test);

          await SnapshotViewer.header.toggleCommentSidebar();
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(false);
        });
      });

      describe('when there are open comments', function() {
        beforeEach(async function() {
          makeList('comment-thread', 2, 'withTwoComments', {snapshot});
          await this.render(hbs`{{snapshot-viewer
            snapshot=snapshot
            build=build
            showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
            userSelectedWidth=userSelectedWidth
            createReview=createReview
            activeBrowser=browser
            isBuildApprovable=isBuildApprovable
            updateActiveSnapshotBlockId=stub
            createCommentThread=stub
          }}`);
        });

        it('shows panel by default', async function() {
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(true);
        });

        it('opens and closes sidebar when toggle button is clicked', async function() {
          await SnapshotViewer.header.toggleCommentSidebar();
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(false);
          await percySnapshot(this.test);

          await SnapshotViewer.header.toggleCommentSidebar();
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(true);
        });
      });

      describe('when there are only closed comments', function() {
        beforeEach(async function() {
          make('comment-thread', 'withTwoComments', 'closed', {snapshot});
          make('comment-thread', 'withTwoComments', 'closed', 'note', {snapshot});
          await this.render(hbs`{{snapshot-viewer
            snapshot=snapshot
            build=build
            showSnapshotFullModalTriggered=showSnapshotFullModalTriggered
            userSelectedWidth=userSelectedWidth
            createReview=createReview
            activeBrowser=browser
            isBuildApprovable=isBuildApprovable
            updateActiveSnapshotBlockId=stub
            createCommentThread=stub
          }}`);
        });

        it('does not show panel by default', async function() {
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(false);
        });

        it('opens and closes sidebar when toggle button is clicked', async function() {
          await SnapshotViewer.header.toggleCommentSidebar();
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(true);
          await percySnapshot(this.test);

          await SnapshotViewer.header.toggleCommentSidebar();
          expect(SnapshotViewer.collaborationPanel.isVisible).to.equal(false);
        });
      });
    });
  });
});
