/* jshint expr:true */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {resolve} from 'rsvp';
import FullSnapshotPage from 'percy-web/tests/pages/components/snapshot-viewer-full';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

describe('Integration: SnapshotViewerFull', function() {
  setupRenderingTest('snapshot-viewer-full', {
    integration: true,
  });

  let closeSnapshotFullModalStub;
  let updateComparisonModeStub;
  let createReviewStub;
  let addedSnapshot;
  let snapshot;
  let build;
  const snapshotTitle = 'Awesome snapshot title';

  beforeEach(async function() {
    setupFactoryGuy(this);
    FullSnapshotPage.setContext(this);

    build = make('build', 'finished');
    const browser = make('browser');
    snapshot = make('snapshot', 'withComparisons', {
      build,
      name: snapshotTitle,
    });

    addedSnapshot = make('snapshot', 'new', {build});

    closeSnapshotFullModalStub = sinon.stub();
    updateComparisonModeStub = sinon.stub();
    createReviewStub = sinon.stub().returns(resolve());

    const snapshotSelectedWidth = snapshot
      .get('comparisons')
      .sortBy('width')
      .objectAt(1)
      .get('width');

    this.setProperties({
      snapshotSelectedWidth,
      browser,
      snapshot: snapshot,
      comparisonMode: 'diff',
      closeSnapshotFullModal: closeSnapshotFullModalStub,
      updateComparisonMode: updateComparisonModeStub,
      createReview: createReviewStub,
      isBuildApprovable: true,
      stub: sinon.stub(),
    });

    await this.render(hbs`{{snapshot-viewer-full
      snapshot=snapshot
      snapshotSelectedWidth=snapshotSelectedWidth
      comparisonMode=comparisonMode
      transitionRouteToWidth=stub
      updateComparisonMode=updateComparisonMode
      closeSnapshotFullModal=closeSnapshotFullModal
      createReview=createReview
      activeBrowser=browser
      isBuildApprovable=isBuildApprovable
      updateSnapshotId=stub
      createCommentThread=stub
      closeCommentThread=stub
      createComment=stub
    }}`);
  });

  it('displays snapshot name', function() {
    expect(FullSnapshotPage.header.isTitleVisible, 'title should be visible').to.equal(true);

    expect(FullSnapshotPage.header.titleText, 'title text should be correct').to.equal(
      snapshotTitle,
    );
  });

  describe('comparison mode switcher', function() {
    it('displays comparison mode switcher', function() {
      expect(
        FullSnapshotPage.header.isComparisonModeSwitcherVisible,
        'comparison mode switcher should be visible',
      ).to.equal(true);
    });

    it('sends updateComparisonMode action when comparison switcher is clicked', async function() {
      await FullSnapshotPage.header.clickBaseComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('base');

      await FullSnapshotPage.header.clickDiffComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('diff');

      await FullSnapshotPage.header.clickHeadComparisonMode();
      expect(updateComparisonModeStub).to.have.been.calledWith('head');
    });

    it('shows "New" button when snapshot is new', async function() {
      this.set('snapshot', addedSnapshot);

      expect(FullSnapshotPage.isNewComparisonModeButtonVisible).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('width switcher', function() {
    it('displays', function() {
      expect(
        FullSnapshotPage.header.isWidthSwitcherVisible,
        'width switcher should be visible',
      ).to.equal(true);
    });

    it('displays correct number as selected', function() {
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(true);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(false);
    });

    it('updates active button when clicked', async function() {
      await FullSnapshotPage.header.widthSwitcher.buttons.objectAt(0).click();
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(true);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(false);
      await FullSnapshotPage.header.widthSwitcher.buttons.objectAt(2).click();
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(true);

      await FullSnapshotPage.header.widthSwitcher.buttons.objectAt(1).click();
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(0).isActive).to.equal(false);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(1).isActive).to.equal(true);
      expect(FullSnapshotPage.header.widthSwitcher.buttons.objectAt(2).isActive).to.equal(false);
    });
  });

  it('compares visually to previous screenshot', async function() {
    await percySnapshot(this.test);
  });

  describe('full screen toggle button', function() {
    it('displays', function() {
      expect(FullSnapshotPage.header.isFullScreenToggleVisible).to.equal(true);
    });

    it('sends closeSnapshotFullModal when toggle fullscreen button is clicked', async function() {
      await FullSnapshotPage.header.clickToggleFullscreen();
      expect(closeSnapshotFullModalStub).to.have.been.called;
    });
  });

  describe('approve snapshot button', function() {
    it('sends createReview with correct arguments when approve button is clicked', async function() { //eslint-disable-line
      await FullSnapshotPage.header.clickApprove();
      expect(createReviewStub).to.have.been.calledWith([snapshot]);
    });

    it('does not display when build is not finished', function() {
      this.set('snapshot.build.isFinished', false);
      expect(FullSnapshotPage.header.snapshotApprovalButton.isVisible).to.equal(false);
    });

    it('is disabled when isBuildApprovable is false', function() {
      this.set('isBuildApprovable', false);
      expect(FullSnapshotPage.header.snapshotApprovalButton.isDisabled).to.equal(true);
    });
  });

  describe('public build notice', function() {
    it('displays when isBuildApprovable is false', function() {
      this.set('isBuildApprovable', false);
      expect(FullSnapshotPage.isPublicBuildNoticeVisible).to.equal(true);
    });
  });

  describe('commenting', function() {
    describe('panel toggling', function() {
      async function expectToggleWorks({isOpenByDefault = true, context} = {}) {
        await FullSnapshotPage.header.toggleCommentSidebar();
        expect(FullSnapshotPage.collaborationPanel.isVisible).to.equal(!isOpenByDefault);
        await percySnapshot(context.test);

        await FullSnapshotPage.header.toggleCommentSidebar();
        expect(FullSnapshotPage.collaborationPanel.isVisible).to.equal(isOpenByDefault);
      }

      describe('when there are no comments', function() {
        it('does not show panel by default', async function() {
          expect(FullSnapshotPage.collaborationPanel.isVisible).to.equal(false);
        });

        it('opens and closes sidebar when toggle button is clicked', async function() {
          await expectToggleWorks({isOpenByDefault: false, context: this});
        });
      });

      describe('when there are open comments', function() {
        beforeEach(async function() {
          makeList('comment-thread', 2, 'withTwoComments', {snapshot});
        });

        it('shows panel by default', async function() {
          expect(FullSnapshotPage.collaborationPanel.isVisible).to.equal(true);
        });

        it('opens and closes sidebar when toggle button is clicked', async function() {
          await expectToggleWorks({isOpenByDefault: true, context: this});
        });
      });

      describe('when there are only closed comments', function() {
        beforeEach(async function() {
          make('comment-thread', 'withTwoComments', 'closed', {snapshot});
          make('comment-thread', 'withTwoComments', 'closed', 'note', {snapshot});
        });

        it('shows panel by default', async function() {
          expect(FullSnapshotPage.collaborationPanel.isVisible).to.equal(true);
        });

        it('opens and closes sidebar when toggle button is clicked', async function() {
          await expectToggleWorks({isOpenByDefault: true, context: this});
        });
      });
    });
  });
});
