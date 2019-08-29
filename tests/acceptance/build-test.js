import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import {currentRouteName, currentURL, findAll} from '@ember/test-helpers';
import {isVisible as attacherIsVisible} from 'ember-attacher';
import {percySnapshot} from 'ember-percy';
import {beforeEach} from 'mocha';
import moment from 'moment';
import sinon from 'sinon';
import {TEST_IMAGE_URLS} from 'percy-web/mirage/factories/screenshot';
import {BUILD_STATES} from 'percy-web/models/build';
import {
  SNAPSHOT_APPROVED_STATE,
  SNAPSHOT_REJECTED_STATE,
  SNAPSHOT_REVIEW_STATE_REASONS,
} from 'percy-web/models/snapshot';
import BuildPage from 'percy-web/tests/pages/build-page';
import ProjectPage from 'percy-web/tests/pages/project-page';
import withVariation from 'percy-web/tests/helpers/with-variation';
import {PusherMock} from 'pusher-js-mock';
import {settled} from '@ember/test-helpers';

describe('Acceptance: Build', function() {
  freezeMoment('2018-05-22');

  async function displaysCommentsOnFirstSnapshot(context) {
    const firstSnapshot = BuildPage.snapshots[0];
    expect(firstSnapshot.collaborationPanel.isVisible).to.equal(true);
    expect(firstSnapshot.commentThreads.length).to.equal(3);
    expect(firstSnapshot.header.numOpenCommentThreads).to.equal('3');
    await percySnapshot(context.test);
  }

  async function createsCommentReplyOnFirstSnapshot() {
    // Because we don't show all replies in long comment threads,
    // it's helpful to test this on a thread with two or fewer comments on it

    const firstSnapshot = BuildPage.snapshots[0];
    const secondThread = firstSnapshot.commentThreads[1];
    expect(secondThread.comments.length).to.equal(1);

    await secondThread.focusReply();
    await secondThread.typeReply('what a great reply');
    await secondThread.submitReply();

    expect(secondThread.comments.length).to.equal(2);
  }

  async function closesCommentThreadOnFirstSnapshot(context) {
    const firstSnapshot = BuildPage.snapshots[0];
    const collabPanel = firstSnapshot.collaborationPanel;
    expect(firstSnapshot.header.numOpenCommentThreads).to.equal('3');
    expect(collabPanel.isShowArchivedCommentsVisible).to.equal(false);
    expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
    expect(collabPanel.reviewThreads[1].isResolved).to.equal(false);
    expect(collabPanel.noteThreads[0].isArchived).to.equal(false);
    await collabPanel.reviewThreads[0].close();

    // Comment threads are ordered with open threads first and closed threads second.
    // Since we have just closed one of the open threads, it has moved under the open threads.
    expect(firstSnapshot.header.numOpenCommentThreads).to.equal('2');
    expect(collabPanel.isShowArchivedCommentsVisible).to.equal(true);
    expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
    expect(collabPanel.noteThreads[0].isArchived).to.equal(false);

    await collabPanel.noteThreads[0].close();
    expect(firstSnapshot.header.numOpenCommentThreads).to.equal('1');
    expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);

    await collabPanel.showArchivedComments();
    expect(collabPanel.commentThreads.length).to.equal(3);

    await percySnapshot(context.test);
  }

  function _expectConfirmDialogShowingAndSideEffects(button) {
    expect(BuildPage.isConfirmDialogVisible).to.equal(true);
    expect(button['isLoading']).to.equal(true);
  }

  function _expectConfirmDialogHiddenAndSideEffects(button) {
    expect(BuildPage.isConfirmDialogVisible).to.equal(false);
    expect(button['isLoading']).to.equal(false);
  }

  setupAcceptance();

  let project;
  let build;
  let defaultSnapshot;
  let noDiffsSnapshot;
  let twoWidthsSnapshot;
  let mobileSnapshot;
  let urlParams;

  setupSession(function(server) {
    withVariation(this.owner, 'request-changes', false);

    const organization = server.create('organization', 'withUser');
    project = server.create('project', {name: 'project-with-finished-build', organization});
    build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      finishedAt: moment().subtract(5, 'seconds'),
      totalSnapshotsUnreviewed: 3,
      totalSnapshots: 4,
      totalComparisons: 6,
    });

    defaultSnapshot = server.create('snapshot', 'withComparison', {build});
    noDiffsSnapshot = server.create('snapshot', 'noDiffs', {
      build,
      name: 'No Diffs snapshot',
    });
    twoWidthsSnapshot = server.create('snapshot', 'rejected', 'withComparison', 'withMobile', {
      build,
      name: 'Two widths snapshot',
    });
    mobileSnapshot = server.create('snapshot', 'withMobile', {
      build,
      name: 'Mobile only snapshot',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('does not display any tooltips if not a demo project', async function() {
    await BuildPage.visitBuild(urlParams);

    // check that the tooltips actually exist on the page
    expect(BuildPage.demoTooltips.length).to.be.at.least(2);

    // verify that all tooltips are not visible
    BuildPage.demoTooltips.forEach(tooltip => {
      expect(tooltip.isAnchorVisible).to.equal(false);
    });
  });

  it('fetches only snapshots with diffs on initial load', async function() {
    // add some snapshots (to the four above) to cover every review state reason.
    server.create('snapshot', 'withComparison', 'userApproved', {build});
    server.create('snapshot', 'withComparison', 'userApprovedPreviously', {build});

    await BuildPage.visitBuild(urlParams);
    const store = this.owner.__container__.lookup('service:store');
    expect(BuildPage.snapshots.length).to.equal(5);
    expect(BuildPage.isUnchangedPanelVisible).to.equal(true);
    expect(store.peekAll('snapshot').get('length')).to.equal(5);

    await BuildPage.snapshotList.clickToggleNoDiffsSection();
    expect(BuildPage.snapshots.length).to.equal(6);
    expect(store.peekAll('snapshot').get('length')).to.equal(6);
  });

  describe('snapshot order/caching', function() {
    beforeEach(function() {
      server.createList('snapshot', 5, 'withComparison', 'userApproved', {
        build,
        fingerprint: 'approvedGroup',
      });

      server.createList('snapshot', 3, 'withComparison', 'unreviewed', {
        build,
        fingerprint: 'unapprovedGroup',
      });
    });

    // eslint-disable-next-line
    it('displays snapshots in the correct order, before and after approval when build is finished', async function() {
      const firstSnapshotExpectedName = defaultSnapshot.name;
      const secondSnapshotExpectedName = twoWidthsSnapshot.name;

      await BuildPage.visitBuild(urlParams);
      expect(BuildPage.snapshotBlocks[0].name).to.equal('3 matching changes');
      expect(BuildPage.snapshotBlocks[1].name).to.equal(firstSnapshotExpectedName);
      expect(BuildPage.snapshotBlocks[2].name).to.equal(secondSnapshotExpectedName);
      expect(BuildPage.snapshotBlocks[4].name).to.equal('5 matching changes');

      await BuildPage.snapshotBlocks[1].clickApprove();
      expect(BuildPage.snapshotBlocks[0].name).to.equal('3 matching changes');
      expect(BuildPage.snapshotBlocks[1].name).to.equal(firstSnapshotExpectedName);
      expect(BuildPage.snapshotBlocks[2].name).to.equal(secondSnapshotExpectedName);
      expect(BuildPage.snapshotBlocks[4].name).to.equal('5 matching changes');

      await BuildPage.snapshotBlocks[0].clickApprove();
      expect(BuildPage.snapshotBlocks[0].name).to.equal('3 matching changes');
      expect(BuildPage.snapshotBlocks[1].name).to.equal(firstSnapshotExpectedName);
      expect(BuildPage.snapshotBlocks[2].name).to.equal(secondSnapshotExpectedName);
      expect(BuildPage.snapshotBlocks[4].name).to.equal('5 matching changes');
    });

    it('behaves correctly when approving snapshots within a group', async function() {
      await BuildPage.visitBuild(urlParams);
      let firstSnapshotGroup = BuildPage.snapshotBlocks[0].snapshotGroup;

      await firstSnapshotGroup.toggleShowAllSnapshots();
      let firstSnapshot = firstSnapshotGroup.snapshots[0];
      await percySnapshot(this.test.fullTitle() + 'group is expanded');

      expect(firstSnapshotGroup.snapshots.length).to.equal(3);

      await firstSnapshot.clickApprove();
      await percySnapshot(this.test.fullTitle() + 'group is expanded, first snapshot is approved');
      expect(firstSnapshotGroup.snapshots[0]).to.equal(firstSnapshot);
      expect(firstSnapshot.isApproved).to.equal(true);
      expect(firstSnapshot.isExpanded).to.equal(true);
      expect(firstSnapshotGroup.isApproved).to.equal(false);
    });

    // This tests the polling behavior in build-container and that initializeSnapshotOrdering method
    // is called and works correctly in builds/build controller.
    // eslint-disable-next-line
    it('sorts snapshots correctly when a build moves from processing to finished via polling', async function() {
      // Get the mirage build object, set it to pending
      const build = server.schema.builds.where({id: '1'}).models[0];
      build.update({state: BUILD_STATES.PROCESSING});

      // Set a defaultSnapshot (which would normally display first)
      // to approved so we have some sort behavior.
      defaultSnapshot.reviewState = SNAPSHOT_APPROVED_STATE;
      defaultSnapshot.reviewStateReason = SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED;

      // Overwrite the build endpoint so the first time it will return the processing build
      // and the second time it will return a finished build.
      // This mocks the polling behavior (since the poller runs once in tests) and mocks the effect
      // of a build transitioning from processing to finished.
      const url = `/builds/${build.id}`;
      let hasVisitedBuildPage = false;
      server.get(url, () => {
        if (!hasVisitedBuildPage) {
          hasVisitedBuildPage = true;
          return build;
        } else {
          build.update({state: BUILD_STATES.FINISHED});
          return build;
        }
      });

      await BuildPage.visitBuild(urlParams);

      // We approved the snapshot that would normally be seen as first (default snapshot).
      // So the normal second snapshot (twoWidthsSnapshot) will now be first, and defaultSnapshot
      // will be second.
      expect(BuildPage.snapshotList.lastSnapshot.name).to.equal(defaultSnapshot.name);
      expect(BuildPage.snapshotBlocks[0].name).to.equal('3 matching changes');
      expect(BuildPage.snapshotBlocks[1].name).to.equal(twoWidthsSnapshot.name);

      await percySnapshot(this.test);
    });
  });

  describe('commenting', function() {
    beforeEach(async function() {
      server.create('commentThread', 'withTwoComments', {
        snapshot: defaultSnapshot,
      });
      server.create('commentThread', 'withOneComment', {
        snapshot: defaultSnapshot,
      });
      server.create('commentThread', 'withTenComments', 'note', {
        snapshot: defaultSnapshot,
      });
    });

    it('displays correctly with many comments', async function() {
      await BuildPage.visitBuild(urlParams);
      await displaysCommentsOnFirstSnapshot(this);
    });
    it('can create a new comment reply', async function() {
      await BuildPage.visitBuild(urlParams);
      await createsCommentReplyOnFirstSnapshot();
    });
    it('can close comment threads', async function() {
      await BuildPage.visitBuild(urlParams);
      await closesCommentThreadOnFirstSnapshot(this);
    });

    it('can create a new comment thread', async function() {
      withVariation(this.owner, 'request-changes', true);
      await BuildPage.visitBuild(urlParams);
      const secondSnapshot = BuildPage.snapshots[1];
      await secondSnapshot.header.toggleCommentSidebar();
      await secondSnapshot.collaborationPanel.newComment.typeNewComment('wow, what a great thread');
      await secondSnapshot.collaborationPanel.newComment.mentionableTextarea.selectFirstUser(
        `${secondSnapshot.collaborationPanel.newComment.scope} textarea`,
      );
      await secondSnapshot.collaborationPanel.newComment.checkRequestChangesBox();

      await secondSnapshot.collaborationPanel.newComment.submitNewThread();

      expect(secondSnapshot.commentThreads.length).to.equal(1);
      expect(secondSnapshot.header.numOpenCommentThreads).to.equal('1');
      expect(secondSnapshot.collaborationPanel.commentThreads[0].isRejectBadgeVisible).to.equal(
        true,
      );
      expect(secondSnapshot.collaborationPanel.commentThreads[0].wasRejectedPreviously).to.equal(
        false,
      );
      expect(secondSnapshot.isRejected).to.equal(true);

      let request = server.pretender.handledRequests.find(request => {
        return request.url.includes('comments');
      });
      const taggedUser = JSON.parse(request.requestBody).data.relationships['tagged-users'].data[0];
      expect(taggedUser.id).to.equal('1');
      expect(server.db.snapshots.find(twoWidthsSnapshot.id).reviewState).to.equal(
        SNAPSHOT_REJECTED_STATE,
      );

      await percySnapshot(this.test);
    });

    it('displays previously rejected comment threads', async function() {
      const originatingSnapshotPartialUrl = 'the/best/url';

      withVariation(this.owner, 'request-changes', true);
      server.create('commentThread', 'withTwoComments', {
        snapshot: twoWidthsSnapshot,
        originatingSnapshotPartialUrl,
      });
      await BuildPage.visitBuild(urlParams);

      const secondSnapshot = BuildPage.snapshots[1];
      const firstCommentThread = secondSnapshot.collaborationPanel.commentThreads[0];
      expect(firstCommentThread.isRejectBadgeVisible).to.equal(true);
      expect(firstCommentThread.wasRejectedPreviously).to.equal(true);
      expect(firstCommentThread.previousBuildHref).to.equal(originatingSnapshotPartialUrl);

      await percySnapshot(this.test);
    });

    // eslint-disable-next-line
    it('blocks approval of snapshot if there are open review threads on snapshot', async function() {
      await BuildPage.visitBuild(urlParams);
      const firstSnapshot = BuildPage.snapshots[0];

      await firstSnapshot.clickApprove();
      _expectConfirmDialogShowingAndSideEffects(firstSnapshot.approveButton);
      expect(firstSnapshot.isApproved).to.equal(false);
      await percySnapshot(this.test);

      // it acts correctly when you click "Cancel"
      await BuildPage.confirmDialog.cancel.click();
      _expectConfirmDialogHiddenAndSideEffects(firstSnapshot.approveButton);
      expect(firstSnapshot.isApproved).to.equal(false);

      // it acts correctly when you click "Confirm"
      await firstSnapshot.clickApprove();
      await BuildPage.confirmDialog.confirm.click();
      expect(BuildPage.isConfirmDialogVisible).to.equal(false);
      expect(firstSnapshot.isApproved).to.equal(true);
    });

    // eslint-disable-next-line
    it('blocks approval of build if there are open review threads on build', async function() {
      await BuildPage.visitBuild(urlParams);

      await BuildPage.buildApprovalButton.clickButton();
      _expectConfirmDialogShowingAndSideEffects(BuildPage.buildApprovalButton);
      expect(BuildPage.buildApprovalButton.isApproved).to.equal(false);

      // it acts correctly when you click "Cancel"
      await BuildPage.confirmDialog.cancel.click();
      _expectConfirmDialogHiddenAndSideEffects(BuildPage.buildApprovalButton);
      expect(BuildPage.buildApprovalButton.isApproved).to.equal(false);

      // it acts correctly when you click "Confirm"
      await BuildPage.buildApprovalButton.clickButton();
      await BuildPage.confirmDialog.confirm.click();
      _expectConfirmDialogHiddenAndSideEffects(BuildPage.buildApprovalButton);
      BuildPage.snapshots.forEach(snapshot => {
        expect(snapshot.isApproved).to.equal(true);
      });
    });
  });

  describe('when a build is in a public project and user is not a member', function() {
    let publicOrg;
    let publicProject;
    let publicBuild;

    beforeEach(async function() {
      publicOrg = server.create('organization');
      publicProject = server.create('project', 'publiclyReadable', {organization: publicOrg});
      publicBuild = server.create('build', 'withSnapshots', {project: publicProject});
      server.create('commentThread', 'withTwoComments', {
        snapshot: publicBuild.snapshots.models[0],
      });
    });

    it('disables appropriate elements', async function() {
      withVariation(this.owner, 'request-changes', true);
      await BuildPage.visitBuild({
        orgSlug: publicOrg.slug,
        projectSlug: publicProject.slug,
        buildId: publicBuild.id,
      });

      // Does not show comment reply textareas.
      expect(BuildPage.snapshots[0].commentThreads[0].reply.isVisible).to.equal(false);

      // Disables "Request changes" buttons
      expect(
        BuildPage.snapshots.toArray().every(snapshot => snapshot.header.isRejectButtonDisabled),
      ).to.equal(true);

      // Disables "Approve" buttons
      expect(
        BuildPage.snapshots
          .toArray()
          .every(snapshot => snapshot.header.snapshotApprovalButton.isDisabled),
      ).to.equal(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('when a build has more than one browser', function() {
    beforeEach(function() {
      // Add a second browser to the build and each snapshot.
      const chromeBrowser = server.create('browser', 'chrome');
      build.browserIds.push(chromeBrowser.id);

      const snapshots = server.db.snapshots;
      snapshots.forEach(snapshot => {
        const chromeComparison = server.create('comparison', 'forChrome');
        snapshot.comparisonIds.push(chromeComparison.id);
      });
    });

    it('looks correct when switching to other browser', async function() {
      await BuildPage.visitBuild(urlParams);
      expect(BuildPage.browserSwitcher.chromeButton.diffCount).to.equal('3');
      expect(BuildPage.browserSwitcher.firefoxButton.diffCount).to.equal('3');
      await percySnapshot(this.test.fullTitle() + ' before switching browsers');
      await BuildPage.browserSwitcher.switchBrowser();
      await percySnapshot(this.test.fullTitle() + ' after switching browsers');
    });

    it('sorts snapshots correctly when switching to another browser', async function() {
      // Change diff ratio in one browser so the sort behavior is different in the other browser.
      const highDiffComparison = twoWidthsSnapshot.comparisons.models.findBy(
        'browser.browserFamily.slug',
        'firefox',
      );
      highDiffComparison.update({diffRatio: 0.89});

      await BuildPage.visitBuild(urlParams);
      // Same order as above
      expect(BuildPage.snapshots.objectAt(0).name).to.equal(defaultSnapshot.name);
      expect(BuildPage.snapshots.objectAt(1).name).to.equal(twoWidthsSnapshot.name);
      await BuildPage.browserSwitcher.switchBrowser();

      // Previously first snapshot should now be second.
      expect(BuildPage.snapshots.objectAt(0).name).to.equal(twoWidthsSnapshot.name);
      expect(BuildPage.snapshots.objectAt(1).name).to.equal(defaultSnapshot.name);
    });

    it('approves all snapshots when "Approve build" button is clicked', async function() {
      server.createList('snapshot', 2, 'withDiffInOneBrowser', {build});
      await BuildPage.visitBuild(urlParams);
      expect(BuildPage.browserSwitcher.chromeButton.diffCount).to.equal('3');
      expect(BuildPage.browserSwitcher.firefoxButton.diffCount).to.equal('5');

      await BuildPage.browserSwitcher.switchBrowser();
      await BuildPage.buildApprovalButton.clickButton();

      expect(BuildPage.browserSwitcher.chromeButton.isAllApproved).to.equal(true);
      expect(BuildPage.browserSwitcher.firefoxButton.isAllApproved).to.equal(true);
    });
  });

  describe('interacting with a snapshot group', function() {
    let unapprovedSnapshots;
    beforeEach(async function() {
      unapprovedSnapshots = server.createList(
        'snapshot',
        3,
        'withComparison',
        'withMobile',
        'unreviewed',
        {
          build,
          fingerprint: 'unapprovedGroup',
        },
      );
    });

    describe('commenting', function() {
      beforeEach(async function() {
        let commentedSnapshot = unapprovedSnapshots[1];
        server.create('commentThread', 'withTwoComments', {
          snapshot: commentedSnapshot,
        });
        server.create('commentThread', 'withOneComment', {
          snapshot: commentedSnapshot,
        });
        server.create('commentThread', 'withTenComments', 'note', {
          snapshot: commentedSnapshot,
        });

        await BuildPage.visitBuild(urlParams);
      });

      it('displays correctly with many comments', async function() {
        await displaysCommentsOnFirstSnapshot(this);
      });
      it('can create a new comment reply', async function() {
        await createsCommentReplyOnFirstSnapshot();
      });
      it('can close comment threads', async function() {
        await closesCommentThreadOnFirstSnapshot(this);
      });

      it('can create a new comment thread', async function() {
        const firstSnapshot = BuildPage.snapshots[0];

        await firstSnapshot.collaborationPanel.newComment.clickNewThreadButton();
        await firstSnapshot.collaborationPanel.newComment.typeNewComment(
          'wow, what a great thread',
        );
        await firstSnapshot.collaborationPanel.newComment.submitNewThread();

        expect(firstSnapshot.commentThreads.length).to.equal(4);
        expect(firstSnapshot.header.numOpenCommentThreads).to.equal('4');

        await percySnapshot(this.test);
      });

      it('can comment on a grouped snapshot that does not have any comments yet', async function() {
        const firstSnapshotGroup = BuildPage.snapshotBlocks[0].snapshotGroup;
        await firstSnapshotGroup.toggleShowAllSnapshots();
        const secondSnapshot = BuildPage.snapshots[1];

        await secondSnapshot.header.toggleCommentSidebar();
        await secondSnapshot.collaborationPanel.newComment.typeNewComment(
          'wow, what a great thread',
        );
        await secondSnapshot.collaborationPanel.newComment.submitNewThread();

        expect(secondSnapshot.commentThreads.length).to.equal(1);
        expect(secondSnapshot.header.numOpenCommentThreads).to.equal('1');

        await percySnapshot(this.test);
      });

      it('blocks approval of group if there are open review threads on group', async function() {
        await BuildPage.visitBuild(urlParams);

        const firstGroup = BuildPage.snapshotBlocks[0].snapshotGroup;
        await BuildPage.snapshotBlocks[0].clickApprove();
        expect(BuildPage.confirmDialog.isVisible).to.equal(true);
        expect(firstGroup.approveButton.isLoading).to.equal(true);

        // it acts correctly when you click "Cancel"
        await BuildPage.confirmDialog.cancel.click();
        expect(BuildPage.snapshotBlocks[0].isApproved).to.equal(false);
        expect(BuildPage.confirmDialog.isVisible).to.equal(false);
        expect(firstGroup.approveButton.isLoading).to.equal(false);

        // it acts correctly when you click "Confirm"
        await BuildPage.snapshotBlocks[0].clickApprove();
        await BuildPage.confirmDialog.confirm.click();
        expect(BuildPage.confirmDialog.isVisible).to.equal(false);
        expect(firstGroup.isApproved).to.equal(true);
      });
    });

    it('rejects all snapshots in a group', async function() {
      withVariation(this.owner, 'request-changes', true);
      await BuildPage.visitBuild(urlParams);
      const firstGroup = BuildPage.snapshotBlocks[0].snapshotGroup;
      expect(server.db.reviews.length).to.equal(0);

      await firstGroup.reject();

      const review = server.db.reviews.firstObject;
      expect(server.db.reviews.length).to.equal(1);
      expect(review.action).to.equal('request_changes');
      expect(review.snapshotIds.length).to.equal(3);
      expect(review.snapshotIds).to.eql(unapprovedSnapshots.mapBy('id'));

      await percySnapshot(this.test);
    });

    it('blocks approval of group when any of its snapshots are rejected', async function() {
      withVariation(this.owner, 'request-changes', true);
      await BuildPage.visitBuild(urlParams);
      const firstGroup = BuildPage.snapshotBlocks[0].snapshotGroup;

      // Reject a snapshot so we can approve the group.
      await firstGroup.header.toggleShowAllSnapshots();
      await BuildPage.rejectFirstSnapshot();
      expect(server.db.reviews.length).to.equal(1);

      await firstGroup.approve();
      _expectConfirmDialogShowingAndSideEffects(firstGroup.approveButton);

      // it acts correctly when you click "Cancel"
      await BuildPage.cancelConfirm();
      expect(firstGroup.isApproved).to.equal(false);
      _expectConfirmDialogHiddenAndSideEffects(firstGroup.approveButton);
      expect(server.db.reviews.length).to.equal(1);

      // it acts correctly when you click "Confirm"
      await firstGroup.approve();
      await BuildPage.continueConfirm();
      expect(firstGroup.isApproved).to.equal(true);
      expect(server.db.reviews.length).to.equal(2);
    });

    it('shows first snapshot in fullscreen view', async function() {
      await BuildPage.visitBuild(urlParams);
      await BuildPage.snapshotBlocks[0].clickToggleFullscreen();
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      expect(currentURL()).to.include(build.id);
      expect(currentURL()).to.include(unapprovedSnapshots[0].id);
      percySnapshot(this.test);
    });

    it('switches widths', async function() {
      await BuildPage.visitBuild(urlParams);
      const firstWidthSwitcher = BuildPage.snapshotBlocks[0].header.widthSwitcher;
      expect(firstWidthSwitcher.buttons[0].isActive).to.equal(false);
      expect(firstWidthSwitcher.buttons[1].isActive).to.equal(true);

      await firstWidthSwitcher.buttons[0].click();
      expect(firstWidthSwitcher.buttons[0].isActive).to.equal(true);
      expect(firstWidthSwitcher.buttons[1].isActive).to.equal(false);
      percySnapshot(this.test);
    });
  });

  it('shows build overview info dropdown', async function() {
    await BuildPage.visitBuild(urlParams);
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle());
  });

  it('toggles the image and pdiff', async function() {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    const snapshot = BuildPage.findSnapshotByName(defaultSnapshot.name);
    await snapshot.clickDiffImage();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(false);

    await percySnapshot(this.test.fullTitle() + ' | hides overlay');
    await snapshot.clickDiffImageBox();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(true);

    await percySnapshot(this.test.fullTitle() + ' | shows overlay');
    await BuildPage.typeDiffToggleKey();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(false);
  });

  it('always shows diffs when navigating to a new route', async function() {
    // Add another build so we can transition to it.
    server.create('build', {
      project,
      createdAt: moment().subtract(5, 'minutes'),
      finishedAt: moment().subtract(10, 'seconds'),
      totalSnapshotsUnreviewed: 1,
      totalSnapshots: 1,
      baseBuild: server.create('build'),
    });

    await BuildPage.visitBuild(urlParams);
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(true);

    await BuildPage.clickToggleDiffsButton();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(false);

    await BuildPage.clickProject();
    await ProjectPage.builds.objectAt(0).click();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(true);
  });

  it('walk across snapshots with arrow keys', async function() {
    let firstSnapshot;
    let secondSnapshot;
    let thirdSnapshot;
    const urlBase = `/${project.fullSlug}/builds/1`;

    await BuildPage.visitBuild(urlParams);
    firstSnapshot = BuildPage.snapshots.objectAt(0);
    secondSnapshot = BuildPage.snapshots.objectAt(1);
    thirdSnapshot = BuildPage.snapshots.objectAt(2);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    expect(currentURL()).to.equal(urlBase);

    await BuildPage.typeDownArrow();
    await percySnapshot(this.test.fullTitle() + ' | Down');
    expect(BuildPage.focusedSnapshot().name).to.equal(defaultSnapshot.name);
    expect(firstSnapshot.isFocused).to.equal(true);
    expect(secondSnapshot.isFocused).to.equal(false);
    expect(thirdSnapshot.isFocused).to.equal(false);

    await BuildPage.typeDownArrow();
    await percySnapshot(this.test.fullTitle() + ' | Down > Down');
    expect(BuildPage.focusedSnapshot().name).to.equal(twoWidthsSnapshot.name);
    expect(firstSnapshot.isFocused).to.equal(false);
    expect(secondSnapshot.isFocused).to.equal(true);
    expect(thirdSnapshot.isFocused).to.equal(false);

    await BuildPage.typeUpArrow();
    await percySnapshot(this.test.fullTitle() + ' | Down > Down > Up');
    expect(BuildPage.focusedSnapshot().name).to.equal(defaultSnapshot.name);
    expect(firstSnapshot.isFocused).to.equal(true);
    expect(secondSnapshot.isFocused).to.equal(false);
    expect(thirdSnapshot.isFocused).to.equal(false);
  });

  it('shows and hides unchanged diffs', async function() {
    const snapshotName = noDiffsSnapshot.name;

    await BuildPage.visitBuild(urlParams);
    expect(BuildPage.isUnchangedPanelVisible).to.equal(true);
    expect(BuildPage.findSnapshotByName(snapshotName)).to.not.exist;

    await percySnapshot(this.test.fullTitle() + ' | shows batched no diffs');
    await BuildPage.clickToggleNoDiffsSection();
    const snapshot = BuildPage.findSnapshotByName(snapshotName);
    expect(BuildPage.isUnchangedPanelVisible).to.equal(false);
    expect(snapshot.isExpanded).to.equal(false);
    expect(snapshot.isNoDiffBoxVisible).to.equal(false);

    const lastSnapshot = BuildPage.snapshotList.lastSnapshot;
    await lastSnapshot.expandSnapshot();
    expect(BuildPage.isUnchangedPanelVisible).to.equal(false);
    expect(lastSnapshot.isExpanded).to.equal(true);
    expect(lastSnapshot.isUnchangedComparisonsVisible).to.equal(true);

    await percySnapshot(this.test.fullTitle() + ' | shows expanded no diffs');
  });

  it('resets visible snapshots between builds', async function() {
    const baseBuild = server.create('build', {project});
    build.update({baseBuild});

    noDiffsSnapshot = server.create('snapshot', 'noDiffs', {
      build: baseBuild,
      name: 'No Diffs snapshot',
    });

    await BuildPage.visitBuild(urlParams);
    expect(BuildPage.snapshotList.isNoDiffsBatchVisible).to.equal(true);

    await BuildPage.clickToggleNoDiffsSection();
    await BuildPage.toggleBuildInfoDropdown();
    await BuildPage.buildInfoDropdown.clickBaseBuild();
    expect(BuildPage.snapshotList.isNoDiffsBatchVisible).to.equal(true);

    await BuildPage.snapshotList.clickToggleNoDiffsSection();
    expect(BuildPage.snapshots.length).to.equal(1);
    expect(BuildPage.snapshots.objectAt(0).isCollapsed).to.equal(true);
  });

  it('toggles full view', async function() {
    await BuildPage.visitBuild(urlParams);
    await BuildPage.snapshots.objectAt(0).header.clickToggleFullscreen();
    expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
    expect(BuildPage.snapshotFullscreen.isVisible).to.equal(true);

    await BuildPage.snapshotFullscreen.header.clickToggleFullscreen();
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    expect(BuildPage.snapshotFullscreen.isVisible).to.equal(false);
  });

  it('creates a review object when clicking "Approve"', async function() {
    await BuildPage.visitBuild(urlParams);
    expect(server.db.reviews.length).to.equal(0);

    await BuildPage.snapshots.objectAt(0).clickApprove();
    expect(server.db.reviews.length).to.equal(1);

    const snapshotReview = server.db.reviews.find(1);
    expect(snapshotReview.action).to.equal('approve');
    expect(snapshotReview.buildId).to.equal(build.id);
    expect(snapshotReview.snapshotIds).to.eql([defaultSnapshot.id]);

    await BuildPage.buildApprovalButton.clickButton();
    expect(server.db.reviews.length).to.equal(2);

    const buildReview = server.db.reviews.find(2);
    expect(buildReview.action).to.equal('approve');
    expect(buildReview.buildId).to.equal(build.id);
    // It should only send the snapshots with diffs
    expect(buildReview.snapshotIds).to.eql([
      defaultSnapshot.id,
      twoWidthsSnapshot.id,
      mobileSnapshot.id,
    ]);
  });

  it('creates a rejected review object when clicking "Request changes"', async function() {
    withVariation(this.owner, 'request-changes', true);
    await BuildPage.visitBuild(urlParams);
    const firstSnapshot = BuildPage.snapshots.objectAt(0);

    expect(server.db.reviews.length).to.equal(0);
    expect(firstSnapshot.commentThreads.length).to.equal(0);
    await firstSnapshot.clickReject();

    const snapshotReview = server.db.reviews.find(1);
    expect(snapshotReview.action).to.equal('request_changes');
    expect(snapshotReview.buildId).to.equal(build.id);
    expect(snapshotReview.snapshotIds).to.eql([defaultSnapshot.id]);

    expect(firstSnapshot.commentThreads.length).to.equal(1);
    await percySnapshot(this.test);
  });

  it('blocks approval of snapshot when snapshot is rejected', async function() {
    withVariation(this.owner, 'request-changes', true);
    await BuildPage.visitBuild(urlParams);
    const firstSnapshot = BuildPage.snapshots[0];

    // Reject a snapshot so we can approve it.
    await BuildPage.rejectFirstSnapshot();
    expect(server.db.reviews.length).to.equal(1);

    await BuildPage.approveFirstSnapshot();
    _expectConfirmDialogShowingAndSideEffects(firstSnapshot.approveButton);

    // it acts correctly when you click "Cancel"
    await BuildPage.cancelConfirm();
    expect(BuildPage.isFirstSnapshotApproved).to.equal(false);
    _expectConfirmDialogHiddenAndSideEffects(firstSnapshot.approveButton);
    expect(server.db.reviews.length).to.equal(1);

    // it acts correctly when you click "Confirm"
    await BuildPage.approveFirstSnapshot();
    await BuildPage.continueConfirm();
    expect(BuildPage.isConfirmDialogVisible).to.equal(false);
    expect(BuildPage.isFirstSnapshotApproved).to.equal(true);
    expect(server.db.reviews.length).to.equal(2);
  });

  it('blocks approval of build when any of its snapshots are rejected', async function() {
    withVariation(this.owner, 'request-changes', true);
    await BuildPage.visitBuild(urlParams);
    const secondSnapshot = BuildPage.snapshots.objectAt(1);

    // Reject some snapshots so we can approve the build.
    await BuildPage.rejectFirstSnapshot();
    expect(server.db.reviews.length).to.equal(1);
    await secondSnapshot.clickReject();
    expect(server.db.reviews.length).to.equal(2);

    await BuildPage.approve();
    _expectConfirmDialogShowingAndSideEffects(BuildPage.buildApprovalButton);

    // it acts correctly when you click "Cancel"
    await BuildPage.cancelConfirm();
    expect(BuildPage.isFirstSnapshotApproved).to.equal(false);
    _expectConfirmDialogHiddenAndSideEffects(BuildPage.buildApprovalButton);
    expect(server.db.reviews.length).to.equal(2);

    // it acts correctly when you click "Confirm"
    await BuildPage.approve();
    await BuildPage.continueConfirm();
    _expectConfirmDialogHiddenAndSideEffects(BuildPage.buildApprovalButton);
    expect(server.db.reviews.length).to.equal(3);
  });

  it('reloads snapshots after build approval', async function() {
    const stub = sinon.stub();

    await BuildPage.visitBuild(urlParams);
    server.get('/builds/:build_id/snapshots', function(schema, request) {
      const build = server.schema.builds.findBy({id: request.params.build_id});
      const snapshots = server.schema.snapshots.where({buildId: build.id});

      stub(build.id, snapshots.models.mapBy('id'));
      return snapshots;
    });
    await BuildPage.buildApprovalButton.clickButton();
    expect(stub).to.have.been.calledWith(build.id, build.snapshots.models.mapBy('id'));
  });
});

describe('Acceptance: Fullscreen Snapshot', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let project;
  let snapshot;
  let urlParams;
  let noDiffSnapshot;
  let secondSnapshot;
  let build;

  setupSession(function(server) {
    withVariation(this.owner, 'request-changes', false);
    const organization = server.create('organization', 'withUser');
    project = server.create('project', {name: 'project-with-finished-build', organization});
    build = server.create('build', {
      totalSnapshots: 3,
      totalSnapshotsUnreviewed: 2,
      project,
      createdAt: moment().subtract(2, 'minutes'),
      finishedAt: moment().subtract(5, 'seconds'),
    });
    snapshot = server.create('snapshot', 'withComparison', {build});
    // Make some other snapshots for the build that should appear when closing the fullscreen view.
    noDiffSnapshot = server.create('snapshot', 'noDiffs', {build});
    secondSnapshot = server.create('snapshot', 'withComparison', {build});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
      snapshotId: snapshot.id,
      width: snapshot.comparisons.models[0].width,
      mode: 'diff',
      browser: 'firefox',
    };
  });

  it('responds to keystrokes and click in full view', async function() {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.typeRightArrow();
    expect(currentURL()).to.include('mode=head');

    await BuildPage.snapshotFullscreen.typeLeftArrow();
    expect(currentURL()).to.include('mode=diff');

    await BuildPage.snapshotFullscreen.clickComparisonViewer();
    expect(currentURL()).to.include('mode=head');

    await BuildPage.snapshotFullscreen.typeEscape();
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    expect(BuildPage.snapshotFullscreen.isVisible).to.equal(false);
  });

  // eslint-disable-next-line
  it('toggles between old/diff/new comparisons when interacting with comparison mode switcher', async function() {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.clickBaseComparisonMode();
    expect(BuildPage.snapshotFullscreen.comparisonImageUrl).to.equal(TEST_IMAGE_URLS.V1);

    await BuildPage.snapshotFullscreen.clickHeadComparisonMode();
    expect(BuildPage.snapshotFullscreen.comparisonImageUrl).to.equal(TEST_IMAGE_URLS.V2);

    await BuildPage.snapshotFullscreen.clickDiffComparisonMode();
    expect(BuildPage.snapshotFullscreen.diffImageUrl).to.equal(TEST_IMAGE_URLS.DIFF_URL);
  });

  describe('next/previous snapshot navigation', function() {
    beforeEach(async function() {});

    it('loops through snapshots with changes', async function() {
      function expectFirstSnapshotURL() {
        expect(currentURL().includes(snapshot.id)).to.equal(true);
        expect(currentURL().includes(secondSnapshot.id)).to.equal(false);
      }

      function expectSecondSnapshotURL() {
        expect(currentURL().includes(snapshot.id)).to.equal(false);
        expect(currentURL().includes(secondSnapshot.id)).to.equal(true);
      }

      await BuildPage.visitFullPageSnapshot(urlParams);
      expectFirstSnapshotURL();

      await BuildPage.snapshotFullscreen.clickNextSnapshot();
      expectSecondSnapshotURL();

      await BuildPage.snapshotFullscreen.clickPreviousSnapshot();
      expectFirstSnapshotURL();

      // Should wrap around
      await BuildPage.snapshotFullscreen.typeUpArrow();
      expectSecondSnapshotURL();

      await BuildPage.snapshotFullscreen.typeUpArrow();
      expectFirstSnapshotURL();
    });

    it('loops through changed + unchanged snapshots', async function() {
      await BuildPage.visitBuild(urlParams);
      await BuildPage.clickToggleNoDiffsSection();
      await BuildPage.snapshots.objectAt(0).header.clickToggleFullscreen();
      expect(currentURL().includes(snapshot.id)).to.equal(true);
      await BuildPage.snapshotFullscreen.clickPreviousSnapshot();
      expect(currentURL().includes(noDiffSnapshot.id)).to.equal(true);
    });

    // eslint-disable-next-line
    it('shows flash message when directly viewing an unchanged snapshot when a build has no changed snapshots', async function() {
      const buildWithNoChanges = server.create('build', {
        totalSnapshots: 1,
        totalSnapshotsUnreviewed: 0,
        project,
      });
      noDiffSnapshot = server.create('snapshot', 'noDiffs', {build: buildWithNoChanges});

      const buildWithNoChangesUrlParams = Object.assign(urlParams, {
        buildId: buildWithNoChanges.id,
      });
      await BuildPage.visitFullPageSnapshot(buildWithNoChangesUrlParams);
      await BuildPage.snapshotFullscreen.clickPreviousSnapshot();
      const flashMessages = findAll('.flash-message.flash-message-info');
      expect(flashMessages).to.have.length(1);
      expect(
        flashMessages[0].innerText.includes("There's no other snapshots to navigate through"),
      ).to.equal(true);
    });
  });

  it('displays the dropdown', async function() {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.header.clickDropdownToggle();
    await percySnapshot(this.test);
  });

  // eslint-disable-next-line
  it("fetches the build's snapshots when the fullscreen view of snapshot with diff is closed", async function() {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.clickToggleFullScreen();
    await percySnapshot(this.test);
    expect(BuildPage.snapshots.length).to.equal(2);
  });

  // eslint-disable-next-line
  it("fetches the build's snapshots when the fullscreen view of snapshot with no diff is closed", async function() {
    urlParams.snapshotId = noDiffSnapshot.id;
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.clickToggleFullScreen();
    expect(BuildPage.snapshots.length).to.equal(2);
    await percySnapshot(this.test);
  });

  it('creates a review object when clicking "Approve"', async function() {
    await BuildPage.visitFullPageSnapshot(urlParams);
    expect(server.db.reviews.length).to.equal(0);

    await BuildPage.snapshotFullscreen.clickApprove();
    expect(server.db.reviews.length).to.equal(1);

    const snapshotReview = server.db.reviews.find(1);
    expect(snapshotReview.action).to.equal('approve');
    expect(snapshotReview.buildId).to.equal(build.id);
    expect(snapshotReview.snapshotIds).to.eql([snapshot.id]);

    expect(snapshot.reviewState).to.equal('approved');
    expect(snapshot.reviewStateReason).to.equal('user_approved');
  });

  it('creates a rejected review object when clicking "Request changes"', async function() {
    withVariation(this.owner, 'request-changes', true);
    await BuildPage.visitFullPageSnapshot(urlParams);
    expect(server.db.reviews.length).to.equal(0);
    expect(BuildPage.snapshotFullscreen.commentThreads.length).to.equal(0);

    await BuildPage.snapshotFullscreen.clickReject();
    expect(server.db.reviews.length).to.equal(1);

    const snapshotReview = server.db.reviews.find(1);
    expect(snapshotReview.action).to.equal('request_changes');
    expect(snapshotReview.buildId).to.equal(build.id);
    expect(snapshotReview.snapshotIds).to.eql([snapshot.id]);

    expect(snapshot.reviewState).to.equal('changes_requested');
    expect(snapshot.reviewStateReason).to.equal('user_requested_changes');
    expect(BuildPage.snapshotFullscreen.commentThreads.length).to.equal(1);
    await percySnapshot(this.test);
  });

  it('redirects to allowed browser when a browser query param is incorrect', async function() {
    urlParams.browser = 'not-a-real-browser';
    await BuildPage.visitFullPageSnapshot(urlParams);
    expect(currentURL()).to.include('browser=firefox');
    expect(findAll('.flash-message.flash-message-danger')).to.have.length(1);
  });

  describe('commenting', function() {
    beforeEach(async function() {
      server.create('commentThread', 'withTwoComments', {snapshot});
      server.create('commentThread', 'withOneComment', {snapshot});
      server.create('commentThread', 'withTenComments', 'note', {snapshot});

      await BuildPage.visitFullPageSnapshot(urlParams);
    });

    it('displays correctly with many comments', async function() {
      const fullscreenSnapshot = BuildPage.snapshotFullscreen;
      expect(fullscreenSnapshot.collaborationPanel.isVisible).to.equal(true);
      expect(fullscreenSnapshot.commentThreads.length).to.equal(3);
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('3');
      await percySnapshot(this.test, {widths: [1280, 850, 375]});
    });

    it('can create a new comment reply', async function() {
      const snapshot = BuildPage.snapshotFullscreen;
      const firstThread = snapshot.commentThreads[0];

      await firstThread.focusReply();
      await firstThread.typeReply('what a great reply');
      await firstThread.submitReply();

      expect(firstThread.comments.length).to.equal(3);
    });

    it('can create a new comment thread', async function() {
      const snapshot = BuildPage.snapshotFullscreen;

      await snapshot.collaborationPanel.newComment.clickNewThreadButton();
      await snapshot.collaborationPanel.newComment.typeNewComment('wow, what a great thread');
      await snapshot.collaborationPanel.newComment.submitNewThread();

      expect(snapshot.commentThreads.length).to.equal(4);
      expect(snapshot.header.numOpenCommentThreads).to.equal('4');

      await percySnapshot(this.test);
    });

    it('can close comment threads', async function() {
      const snapshot = BuildPage.snapshotFullscreen;
      const collabPanel = snapshot.collaborationPanel;

      expect(snapshot.header.numOpenCommentThreads).to.equal('3');
      expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
      expect(collabPanel.reviewThreads[1].isResolved).to.equal(false);
      expect(collabPanel.noteThreads[0].isArchived).to.equal(false);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(false);

      await collabPanel.reviewThreads[0].close();

      // Comment threads are ordered with open threads first and closed threads second.
      // Since we have just closed one of the open threads, it has moved under the open threads.
      expect(snapshot.header.numOpenCommentThreads).to.equal('2');
      expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
      expect(collabPanel.noteThreads[0].isArchived).to.equal(false);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(true);

      await collabPanel.noteThreads[0].close();
      expect(snapshot.header.numOpenCommentThreads).to.equal('1');
      expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(true);

      await percySnapshot(this.test);
    });

    // eslint-disable-next-line
    it('blocks approval of snapshot if there are open review threads on snapshot', async function() {
      const snapshot = BuildPage.snapshotFullscreen;
      await snapshot.clickApprove();
      expect(BuildPage.confirmDialog.isVisible).to.equal(true);
      expect(snapshot.approveButton.isLoading).to.equal(true);
      expect(snapshot.approveButton.isVisible).to.equal(true);
      await percySnapshot(this.test);

      // it acts correctly when you click "Cancel"
      await BuildPage.confirmDialog.cancel.click();
      expect(snapshot.isApproved).to.equal(false);
      expect(BuildPage.confirmDialog.isVisible).to.equal(false);
      expect(snapshot.approveButton.isLoading).to.equal(false);
      expect(snapshot.approveButton.isVisible).to.equal(true);

      // it acts correctly when you click "Confirm"
      await snapshot.clickApprove();
      await BuildPage.confirmDialog.confirm.click();
      expect(BuildPage.confirmDialog.isVisible).to.equal(false);
      expect(snapshot.approveButton.isVisible).to.equal(false);
      expect(snapshot.isApproved).to.equal(true);
    });
  });

  describe('websockets', function() {
    let pusherService;
    let user;
    let commentThread;
    let threadReplyString;
    let archiveThreadString;
    let newThreadCommentString;

    function createWebhookPayload(commentThreadId, snapshotId, user, closed) {
      const lastExistingCommentId = server.db.comments.lastObject.id;
      const newCommentId = Number(lastExistingCommentId) + 1;
      const closedAt = closed ? `"${moment()}"` : null;
      const result = `{
        "data":{
          "type":"comments",
          "id":"${newCommentId}",
          "attributes":{
            "body":"This is an awesome change!",
            "created-at":"2019-08-29T16:47:20.000Z",
            "updated-at":"2019-08-29T16:47:20.000Z"
          },
          "links":{
            "self":"/api/v1/comments/${newCommentId}"
          },
          "relationships":{
            "author":{
              "data":{
                "type":"users",
                "id":"1"
              }
            },
            "comment-thread":{
              "data":{
                "type":"comment-threads",
                "id":"${commentThreadId}"
              }
            }
          }
        },
        "included":[
          {
            "type":"users",
            "id":"${user.id}",
            "attributes":{
              "name":"${user.name}",
              "avatar-url":"${user.avatarUrl}"
            },
            "links":{
              "self":"/api/v1/user"
            }
          },
          {
            "type":"comment-threads",
            "id":"${commentThreadId}",
            "attributes":{
              "type":"note",
              "closed-at":${closedAt},
              "created-at": "2019-08-29T02:06:29.000Z"
            },
            "links":{
              "self":"/api/v1/comment-threads/${commentThreadId}"
            },
            "relationships":{
              "snapshot":{
                "data":{
                  "type":"snapshots",
                  "id":"${snapshotId}"
                }
              },
              "comments":{
                "data":[
                  {
                    "type":"comments",
                    "id":"${newCommentId}"
                  },
                  {
                    "type":"comments",
                    "id":"${lastExistingCommentId}"
                  }
                ]
              }
            }
          }
        ]
      }`;
      return result;
    }

    beforeEach(async function() {
      server.create('commentThread', 'withOneComment', {snapshot});
      commentThread = server.create('commentThread', 'withOneComment', {snapshot});
      pusherService = this.owner.lookup('service:pusher');
      const pusherMock = new PusherMock();
      pusherService.set('_client', pusherMock);
      user = server.create('user');
      threadReplyString = createWebhookPayload(commentThread.id, snapshot.id, user, false);
      archiveThreadString = createWebhookPayload(commentThread.id, snapshot.id, user, true);
      newThreadCommentString = createWebhookPayload(commentThread.id + 1, snapshot.id, user);
    });

    it('displays a new comment thread', async function() {
      await BuildPage.visitFullPageSnapshot(urlParams);
      const fullscreenSnapshot = BuildPage.snapshotFullscreen;
      expect(fullscreenSnapshot.collaborationPanel.isVisible).to.equal(true);
      expect(fullscreenSnapshot.commentThreads.length).to.equal(2);
      const channel = pusherService._client.channels['private-organization-1'];
      channel.emit('objectUpdated', JSON.parse(newThreadCommentString));
      await settled();

      expect(fullscreenSnapshot.commentThreads.length).to.equal(3);
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('3');
      await percySnapshot(this.test);
    });

    it('displays new comments', async function() {
      pusherService.subscribeToOrganization(project.organization);
      await BuildPage.visitFullPageSnapshot(urlParams);
      const snapshot = BuildPage.snapshotFullscreen;
      const firstThread = snapshot.commentThreads[0];
      expect(firstThread.comments.length).to.equal(1);

      const channel = pusherService._client.channels['private-organization-1'];
      channel.emit('objectUpdated', JSON.parse(threadReplyString));
      await settled();

      expect(firstThread.comments.length).to.equal(2);
      await percySnapshot(this.test);
    });

    it('archives a comment thread', async function() {
      pusherService.subscribeToOrganization(project.organization);
      await BuildPage.visitFullPageSnapshot(urlParams);
      const snapshot = BuildPage.snapshotFullscreen;
      const collabPanel = snapshot.collaborationPanel;
      expect(snapshot.header.numOpenCommentThreads).to.equal('2');
      expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(false);

      const channel = pusherService._client.channels['private-organization-1'];
      channel.emit('objectUpdated', JSON.parse(archiveThreadString));
      await settled();

      expect(snapshot.header.numOpenCommentThreads).to.equal('1');
      expect(collabPanel.reviewThreads.length).to.equal(1);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(true);

      await percySnapshot(this.test);
    });

    it('flashes a message for a new comment', async function() {
      user = server.create('user');
      const flashMessageService = this.owner
        .lookup('service:flash-messages')
        .registerTypes(['info']);
      const flashMessageInfoStub = sinon.stub(flashMessageService, 'info');
      pusherService.set('hasSubscribedToUser', null);
      pusherService.subscribeToUser(user);
      const message = "Han Solo commented on snapshot Home Page: 'These changes look great!'";
      server.create('organizationUser', {organization: project.organization, user: user});
      await BuildPage.visitFullPageSnapshot(urlParams);

      const channel = pusherService._client.channels[`private-user-${user.id}`];
      channel.emit('userNotification', {message});
      await settled();

      expect(flashMessageInfoStub).to.have.been.calledWith(message);
      await percySnapshot(this.test);
    });
  });

  describe('when a build is in a public project and user is not a member', function() {
    let publicOrg;
    let publicProject;
    let publicBuild;

    beforeEach(async function() {
      publicOrg = server.create('organization');
      publicProject = server.create('project', 'publiclyReadable', {organization: publicOrg});
      publicBuild = server.create('build', 'withSnapshots', {project: publicProject});
      server.create('commentThread', 'withTwoComments', {
        snapshot: publicBuild.snapshots.models[0],
      });
    });

    it('disables appropriate elements', async function() {
      withVariation(this.owner, 'request-changes', true);

      const snapshot = publicBuild.snapshots.models[0];
      const urlParams = {
        orgSlug: publicOrg.slug,
        projectSlug: publicProject.slug,
        buildId: publicBuild.id,
        snapshotId: snapshot.id,
        width: snapshot.comparisons.models[0].width,
        mode: 'diff',
        browser: 'firefox',
      };
      await BuildPage.visitFullPageSnapshot(urlParams);

      expect(BuildPage.snapshotFullscreen.commentThreads[0].reply.isVisible).to.equal(false);
      expect(BuildPage.snapshotFullscreen.header.isRejectButtonDisabled).to.equal(true);
      expect(BuildPage.snapshotFullscreen.header.snapshotApprovalButton.isDisabled).to.equal(true);
      await percySnapshot(this.test.fullTitle());
    });
  });
});

describe('Acceptance: Auto-approved Branch Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'auto-approved-branch build', organization});
    let build = server.create('build', 'approvedAutoBranch', {project});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as auto-approved', async function() {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page');
  });
});

describe('Acceptance: Pending Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'pending build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'pending',
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as pending', async function() {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    await percySnapshot(this.test.fullTitle() + ' on the build page');
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open');
  });
});

describe('Acceptance: Processing Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'project-with-processing-build', organization});
    let build = server.create('build', 'processing', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as processing', async function() {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page');
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open');
  });
});

describe('Acceptance: Failed Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function(server) {
    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'project-with-failed-build', organization});
    let build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      state: 'failed',
      failureReason: 'render_timeout',
      failureDetails: {failed_snapshots: ['Home page that pops open a dialog']},
    });

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as failed', async function() {
    await BuildPage.visitBuild(urlParams);
    window.Intercom = sinon.stub();
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page');
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open');
    await BuildPage.clickShowSupportLink();
    expect(window.Intercom).to.have.been.calledWith('show');
  });
});

describe('Acceptance: Demo Project Build', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams;

  setupSession(function(server) {
    const organization = server.create('organization', 'withUser');

    const project = server.create('project', 'demo', {
      name: 'project-with-finished-build',
      organization,
    });

    const build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      finishedAt: moment().subtract(5, 'seconds'),
      totalSnapshotsUnreviewed: 1,
      totalSnapshots: 1,
      totalComparisons: 1,
    });

    server.create('snapshot', 'withComparison', {build});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('renders the tooltips', async function() {
    await BuildPage.visitBuild(urlParams);

    const tooltipElement = await findAll('.ember-attacher').firstObject;
    expect(BuildPage.demoTooltips.length).to.equal(6);
    // Anchors on snapshot viewers should be visible
    // This line checks that the index param is being passed correctly
    expect(BuildPage.demoTooltips[3].isAnchorVisible).to.equal(true);

    await BuildPage.demoTooltips.objectAt(0).clickAnchor();
    expect(attacherIsVisible(tooltipElement)).to.equal(true);
  });

  // This test is flaky on CI
  it.skip('moves on to the next tooltip when clicking next', async function() {
    await BuildPage.visitBuild(urlParams);

    const tooltipElements = await findAll('.ember-attacher .nextable');
    const firstTooltip = tooltipElements[0];
    const secondTooltip = tooltipElements[1];

    expect(BuildPage.demoTooltips.length).to.equal(6);
    expect(BuildPage.nextableDemoTooltips.length).to.equal(4);

    await BuildPage.nextableDemoTooltips.objectAt(0).clickAnchor();

    expect(firstTooltip.classList.contains('ember-attacher-show')).to.equal(true);
    expect(secondTooltip.classList.contains('ember-attacher-hide')).to.equal(true);

    await BuildPage.nextableDemoTooltips.objectAt(0).clickNext();

    await expect(secondTooltip.classList.contains('ember-attacher-show')).to.equal(true);
  });

  it('hides all tooltips and all anchors when all are dismissed', async function() {
    await BuildPage.visitBuild(urlParams);

    expect(BuildPage.demoTooltips.length).to.equal(6);

    await BuildPage.demoTooltips.objectAt(0).clickAnchor();
    await BuildPage.demoTooltips.objectAt(0).clickDismissAll();

    // verify that all tooltips were dismissed
    BuildPage.demoTooltips.forEach(demoTooltip => {
      expect(demoTooltip.isAnchorVisible).to.equal(false, 'anchor should be hidden');
    });
  });
});
