import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';
import {
  currentRouteName,
  currentURL,
  findAll,
  visit,
  getContext,
  settled,
} from '@ember/test-helpers';
import {isVisible as attacherIsVisible} from 'ember-attacher';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {beforeEach, afterEach} from 'mocha';
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
import {PusherMock} from 'pusher-js-mock';
import utils from 'percy-web/lib/utils';
// eslint-disable-next-line
import {setupBrowserNavigationButtons} from 'ember-cli-browser-navigation-button-test-helper/test-support';
import withVariation from 'percy-web/tests/helpers/with-variation';

describe('Acceptance: InfiniteBuild', function() {
  freezeMoment('2018-05-22');

  function scrollTestContainer(px) {
    const testContainer = document.getElementById('ember-testing-container');
    testContainer.scroll(0, px);
  }

  async function displaysCommentsOnFirstSnapshot(context) {
    const firstSnapshot = BuildPage.snapshots[0];
    expect(firstSnapshot.collaborationPanel.isVisible).to.equal(true);
    expect(firstSnapshot.commentThreads.length).to.equal(3);
    expect(firstSnapshot.header.numOpenCommentThreads).to.equal('3');
    await percySnapshot(context.test, {darkMode: true});
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

    await percySnapshot(context.test, {darkMode: true});
  }

  function _expectConfirmDialogShowingAndSideEffects(button) {
    expect(BuildPage.isConfirmDialogVisible).to.equal(true);
    expect(button['isLoading']).to.equal(true);
  }

  function _expectConfirmDialogHiddenAndSideEffects(button) {
    expect(BuildPage.isConfirmDialogVisible).to.equal(false);
    expect(button['isLoading']).to.equal(false);
  }

  let hooks = setupAcceptance();

  let backStub;
  let project;
  let build;
  let defaultSnapshot;
  let noDiffsSnapshot;
  let twoWidthsSnapshot;
  let mobileSnapshot;
  let urlParams;

  setupSession(function(server) {

    // withVariation(this.owner, hooks, 'snapshot-sort-api', true);
    console.log('setting snapshot-sort-api to true')
    this.owner.lookup('service:launch-darkly-client').setVariation('snapshot-sort-api', true)

    backStub = sinon.stub(utils, 'windowBack').callsFake(async function() {
      let {owner} = getContext();
      const history = owner.lookup('service:history');
      await history.goBack();
      await settled();
      return;
    });

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

  afterEach(function() {
    backStub.restore();
  });

  it('does not display any tooltips if not a demo project', async function() {
    // let client = this.owner.lookup('service:launch-darkly-client')
    // client.setVariation('snapshot-sort-api', true)

    await BuildPage.visitBuild(urlParams);

    expect(BuildPage.demoTooltips.length).to.equal(0);
  });

  it('fetches only snapshots with diffs on initial load', async function() {

    let client = this.owner.lookup('service:launch-darkly-client')
    console.log('the variation is: ', client.variation('snapshot-sort-api'))


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
      await percySnapshot(this.test.fullTitle() + 'group is expanded', {
        darkMode: true,
      });

      expect(firstSnapshotGroup.snapshots.length).to.equal(3);

      await firstSnapshot.clickApprove();
      await percySnapshot(this.test.fullTitle() + 'group is expanded, first snapshot is approved', {
        darkMode: true,
      });
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

      await percySnapshot(this.test, {darkMode: true});
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
        return request.url.includes('/comments');
      });

      const taggedUser = JSON.parse(request.requestBody).data.relationships['tagged-users'].data[0];
      expect(taggedUser.id).to.equal('1');
      expect(server.db.snapshots.find(twoWidthsSnapshot.id).reviewState).to.equal(
        SNAPSHOT_REJECTED_STATE,
      );

      await percySnapshot(this.test, {darkMode: true});
    });

    it('displays previously rejected comment threads', async function() {
      const commentThread = server.create('commentThread', 'withTwoComments', {
        snapshot: twoWidthsSnapshot,
      });
      const originatingSnapshotId = commentThread.originatingSnapshotId;
      server.create('build');
      server.create('snapshot', 'withComparison', {id: originatingSnapshotId, build});

      await BuildPage.visitBuild(urlParams);

      const secondSnapshot = BuildPage.snapshots[1];
      const firstCommentThread = secondSnapshot.collaborationPanel.commentThreads[0];
      expect(firstCommentThread.isRejectBadgeVisible).to.equal(true);
      expect(firstCommentThread.wasRejectedPreviously).to.equal(true);
      await percySnapshot(`${this.test.fullTitle()} | before following originating snapshot link`, {
        darkMode: true,
      });
      expect(firstCommentThread.previousBuildHref).to.equal(
        // eslint-disable-next-line
        `/${urlParams.orgSlug}/${urlParams.projectSlug}/builds/snapshot/${originatingSnapshotId}/default-comparison`,
      );

      await firstCommentThread.goToOriginatingSnapshot();

      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      await percySnapshot(`${this.test.fullTitle()} | after following originating snapshot link`, {
        darkMode: true,
      });
    });

    // eslint-disable-next-line
    it('blocks approval of snapshot if there are open review threads on snapshot', async function() {
      await BuildPage.visitBuild(urlParams);
      const firstSnapshot = BuildPage.snapshots[0];

      await firstSnapshot.clickApprove();
      _expectConfirmDialogShowingAndSideEffects(firstSnapshot.approveButton);
      expect(firstSnapshot.isApproved).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});

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

      await percySnapshot(this.test, {darkMode: true});
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
      await percySnapshot(this.test.fullTitle() + ' before switching browsers', {darkMode: true});
      await BuildPage.browserSwitcher.switchBrowser();
      await percySnapshot(this.test.fullTitle() + ' after switching browsers', {darkMode: true});
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
        commentedSnapshot.update({totalOpenComments: 13});

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

        await percySnapshot(this.test, {darkMode: true});
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

        await percySnapshot(this.test, {darkMode: true});
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
      await BuildPage.visitBuild(urlParams);
      const firstGroup = BuildPage.snapshotBlocks[0].snapshotGroup;
      expect(server.db.reviews.length).to.equal(0);

      await firstGroup.reject();

      const review = server.db.reviews.firstObject;
      expect(server.db.reviews.length).to.equal(1);
      expect(review.action).to.equal('request_changes');
      expect(review.snapshotIds.length).to.equal(3);
      expect(review.snapshotIds).to.eql(unapprovedSnapshots.mapBy('id'));

      await percySnapshot(this.test, {darkMode: true});
    });

    it('blocks approval of group when any of its snapshots are rejected', async function() {
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
      await percySnapshot(this.test, {darkMode: true});
    });

    it('switches widths', async function() {
      await BuildPage.visitBuild(urlParams);
      const firstWidthSwitcher = BuildPage.snapshotBlocks[0].header.widthSwitcher;
      expect(firstWidthSwitcher.buttons[0].isActive).to.equal(false);
      expect(firstWidthSwitcher.buttons[1].isActive).to.equal(true);

      await firstWidthSwitcher.buttons[0].click();
      expect(firstWidthSwitcher.buttons[0].isActive).to.equal(true);
      expect(firstWidthSwitcher.buttons[1].isActive).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe('when a build has missing snapshots', function() {
    let baseBuild;
    beforeEach(async function() {
      baseBuild = server.create('build', {project});
      build.update({baseBuild});
      build.snapshots.models.forEach(snapshot => {
        server.create('snapshot', {build: baseBuild, name: snapshot.name});
      });

      server.create('snapshot', 'withComparison', {
        build: baseBuild,
        id: 'missing-snapshot-1',
        name: 'missing snapshot 1',
      });
    });

    it('does not display missing-snapshots box when build is not finished', async function() {
      build.update({state: BUILD_STATES.PENDING});
      await BuildPage.visitBuild(urlParams);
      expect(BuildPage.removedSnapshots.isVisible).to.equal(false);
    });

    describe('partial builds', function() {
      beforeEach(async function() {
        build.update({partial: true});
      });
      //eslint-disable-next-line
      it('shows partial header instead of missing snapshots.', async function() {
        await BuildPage.visitBuild(urlParams);
        expect(BuildPage.removedSnapshots.isVisible).to.equal(false);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('displays correctly when there are no snapshots with diffs', async function() {
        build.snapshots.models.forEach(snapshot => {
          snapshot.comparisons.models.forEach(comparison => {
            comparison.update({isSame: true, diffRatio: 0});
          });
        });
        await BuildPage.visitBuild(urlParams);
        await percySnapshot(this.test, {darkMode: true});
      });
    });

    describe('when there is one snapshot missing', function() {
      it('displays correctly', async function() {
        await BuildPage.visitBuild(urlParams);
        await percySnapshot(this.test, {darkMode: true});
      });
    });

    describe('when there are more than one snapshots missing', function() {
      beforeEach(async function() {
        server.create('snapshot', {build: baseBuild, name: 'missing snapshot 2'});
      });

      it('displays correctly', async function() {
        await BuildPage.visitBuild(urlParams);
        await percySnapshot(this.test, {darkMode: true});
      });

      it('shows expansion option when there are many missing snapshots', async function() {
        server.createList('snapshot', 20, {build: baseBuild});

        await BuildPage.visitBuild(urlParams);
        expect(BuildPage.removedSnapshots.snapshotNames.length).to.equal(5);
        await percySnapshot(`${this.test.fullTitle()} | before expansion`, {darkMode: true});

        await BuildPage.removedSnapshots.toggleSnapshots();
        expect(BuildPage.removedSnapshots.snapshotNames.length).to.equal(22);
        await percySnapshot(`${this.test.fullTitle()} | after expansion`, {darkMode: true});

        await BuildPage.removedSnapshots.toggleSnapshots();
        expect(BuildPage.removedSnapshots.snapshotNames.length).to.equal(5);
      });
    });

    it('links to missing snapshots', async function() {
      await BuildPage.visitBuild(urlParams);
      expect(BuildPage.removedSnapshots.isVisible).to.equal(true);
      await BuildPage.removedSnapshots.snapshotNames[0].click();
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      await percySnapshot(this.test, {darkMode: true});
    });

    it('resets removedSnapshots when moving to another build', async function() {
      await BuildPage.visitBuild(urlParams);
      expect(BuildPage.removedSnapshots.isVisible).to.equal(true);
      await BuildPage.removedSnapshots.snapshotNames[0].click();
      await BuildPage.snapshotFullscreen.header.clickToggleFullscreen();
      expect(currentRouteName()).to.equal('organization.project.builds.build.index');

      expect(BuildPage.removedSnapshots.isVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });
  });

  it('shows build overview info dropdown', async function() {
    await BuildPage.visitBuild(urlParams);
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test, {darkMode: true});
  });

  it('toggles the image and pdiff', async function() {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    scrollTestContainer(10000);

    const snapshot = BuildPage.findSnapshotByName(defaultSnapshot.name);
    await snapshot.clickDiffImage();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(false);

    await percySnapshot(this.test.fullTitle() + ' | hides overlay', {darkMode: true});
    await snapshot.clickDiffImageBox();
    expect(BuildPage.isDiffsVisibleForAllSnapshots).to.equal(true);

    await percySnapshot(this.test.fullTitle() + ' | shows overlay', {darkMode: true});
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

  it('walks across snapshots with arrow keys', async function() {
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
    await percySnapshot(this.test.fullTitle() + ' | Down', {darkMode: true});
    expect(firstSnapshot.isFocused).to.equal(true);
    expect(secondSnapshot.isFocused).to.equal(false);
    expect(thirdSnapshot.isFocused).to.equal(false);

    await BuildPage.typeDownArrow();
    await percySnapshot(this.test.fullTitle() + ' | Down > Down', {darkMode: true});
    expect(firstSnapshot.isFocused).to.equal(false);
    expect(secondSnapshot.isFocused).to.equal(true);
    expect(thirdSnapshot.isFocused).to.equal(false);

    await BuildPage.typeUpArrow();
    await percySnapshot(this.test.fullTitle() + ' | Down > Down > Up', {
      darkMode: true,
    });
    expect(firstSnapshot.isFocused).to.equal(true);
    expect(secondSnapshot.isFocused).to.equal(false);
    expect(thirdSnapshot.isFocused).to.equal(false);
  });

  it('shows and hides unchanged diffs', async function() {
    const snapshotName = noDiffsSnapshot.name;

    await BuildPage.visitBuild(urlParams);
    scrollTestContainer(10000);

    expect(BuildPage.isUnchangedPanelVisible).to.equal(true);
    expect(BuildPage.findSnapshotByName(snapshotName)).to.not.exist;

    await percySnapshot(this.test.fullTitle() + ' | shows batched no diffs', {
      darkMode: true,
    });
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

    await percySnapshot(this.test.fullTitle() + ' | shows expanded no diffs', {
      darkMode: true,
    });
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
    setupBrowserNavigationButtons();
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
    expect(firstSnapshot.commentThreads[0].wasRejectedPreviously).to.equal(false);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('blocks approval of snapshot when snapshot is rejected', async function() {
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

  describe('latest changed ancestor', function() {
    async function clickLatestChangedAncestorLink() {
      const firstHeader = BuildPage.snapshots[0].header;
      await firstHeader.clickDropdownToggle();
      await firstHeader.dropdownOptions[firstHeader.dropdownOptions.length - 1].click();
    }

    function expectFlashMessage(message) {
      const flashMessages = findAll('.flash-message.flash-message-info');
      expect(flashMessages.length).to.equal(1);
      expect(flashMessages[0].innerText.includes(message)).to.equal(true);
    }

    function makeErrorEndpoint(statusCode, errors) {
      server.get(
        `/snapshots/${defaultSnapshot.id}/latest-changed-ancestor`,
        () => ({
          errors: errors,
        }),
        statusCode,
      );
    }

    it('navigates to latest changed ancestor snapshot', async function() {
      const parentBuild = server.create('build', 'withSnapshots', {project});
      server.get(`/snapshots/${defaultSnapshot.id}/latest-changed-ancestor`, () => {
        return parentBuild.snapshots.models.firstObject;
      });

      await BuildPage.visitBuild(urlParams);
      await clickLatestChangedAncestorLink();

      expect(currentURL()).to.include(parentBuild.id);
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      await percySnapshot(this.test, {darkMode: true});
    });

    it("shows error message when latest changed ancestor doesn't exist", async function() {
      makeErrorEndpoint(404, [{status: 'not_found'}]);
      await BuildPage.visitBuild(urlParams);
      await clickLatestChangedAncestorLink();

      expectFlashMessage('This is the earliest change we have on record for this snapshot.');
    });

    it('shows error message when latest changed ancestor returns other error', async function() {
      makeErrorEndpoint(401, [{status: 'unauthorized'}]);

      await BuildPage.visitBuild(urlParams);
      await clickLatestChangedAncestorLink();

      expectFlashMessage('There was a problem fetching the latest changed snapshot.');
    });

    //eslint-disable-next-line
    it('shows error message when latest changed ancestor returns incorrectly formatted error', async function() {
      makeErrorEndpoint(450, 'not a standard error format');

      await BuildPage.visitBuild(urlParams);
      await clickLatestChangedAncestorLink();

      expectFlashMessage('There was a problem fetching the latest changed snapshot.');
    });
  });

  it('displays new snapshot', async function() {
    server.create('snapshot', 'new', {build, name: 'ohai'});
    await BuildPage.visitBuild(urlParams);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('displays reintroduced snapshot', async function() {
    server.create('snapshot', 'new', 'reintroduced', {build, name: 'ohai'});
    await BuildPage.visitBuild(urlParams);
    await percySnapshot(this.test, {darkMode: true});
  });
});
