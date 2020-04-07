import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
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
import BuildPage from 'percy-web/tests/pages/build-page';
import utils from 'percy-web/lib/utils';
// eslint-disable-next-line
import {setupBrowserNavigationButtons} from 'ember-cli-browser-navigation-button-test-helper/test-support';
import mockPusher from 'percy-web/tests/helpers/mock-pusher';

describe('Acceptance: Fullscreen Snapshot', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let backStub;
  let project;
  let snapshot;
  let urlParams;
  let noDiffSnapshot;
  let build;
  let websocketService;

  setupSession(function (server) {
    websocketService = mockPusher(this);
    backStub = sinon.stub(utils, 'windowBack').callsFake(async function () {
      let {owner} = getContext();
      const history = owner.lookup('service:history');
      await history.goBack();
      await settled();
      return;
    });

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
    server.create('snapshot', 'withComparison', {build});

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

  afterEach(function () {
    backStub.restore();
  });

  it('responds to keystrokes and click in full view', async function () {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.typeRightArrow();
    expect(currentURL()).to.include('mode=base');

    await BuildPage.snapshotFullscreen.typeLeftArrow();
    expect(currentURL()).to.include('mode=diff');

    await BuildPage.snapshotFullscreen.clickComparisonViewer();
    expect(currentURL()).to.include('mode=base');

    await BuildPage.snapshotFullscreen.typeEscape();
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    expect(BuildPage.snapshotFullscreen.isVisible).to.equal(false);
  });

  // eslint-disable-next-line
  it('toggles between old/diff/new comparisons when interacting with comparison mode switcher', async function () {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.clickBaseComparisonMode();
    expect(BuildPage.snapshotFullscreen.comparisonImageUrl).to.equal(TEST_IMAGE_URLS.V1);

    await BuildPage.snapshotFullscreen.clickHeadComparisonMode();
    expect(BuildPage.snapshotFullscreen.comparisonImageUrl).to.equal(TEST_IMAGE_URLS.V2);

    await BuildPage.snapshotFullscreen.clickDiffComparisonMode();
    expect(BuildPage.snapshotFullscreen.diffImageUrl).to.equal(TEST_IMAGE_URLS.DIFF_URL);
  });

  it('displays the dropdown', async function () {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.header.clickDropdownToggle();
    await percySnapshot(this.test, {darkMode: true});
  });

  // eslint-disable-next-line
  it("fetches the build's snapshots when the fullscreen view of snapshot with diff is closed", async function () {
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.clickToggleFullScreen();
    await percySnapshot(this.test, {darkMode: true});
    expect(BuildPage.snapshots.length).to.equal(2);
  });

  // eslint-disable-next-line
  it("fetches the build's snapshots when the fullscreen view of snapshot with no diff is closed", async function () {
    urlParams.snapshotId = noDiffSnapshot.id;
    await BuildPage.visitFullPageSnapshot(urlParams);
    await BuildPage.snapshotFullscreen.clickToggleFullScreen();
    expect(BuildPage.snapshots.length).to.equal(2);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('creates a review object when clicking "Approve"', async function () {
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

  it('creates a rejected review object when clicking "Request changes"', async function () {
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
    await percySnapshot(this.test, {darkMode: true});
  });

  it('redirects to allowed browser when a browser query param is incorrect', async function () {
    urlParams.browser = 'not-a-real-browser';
    await BuildPage.visitFullPageSnapshot(urlParams);
    expect(findAll('.flash-message.flash-message-danger')).to.have.length(1);
    await percySnapshot(this.test);
  });

  describe('commenting', function () {
    beforeEach(async function () {
      server.create('commentThread', 'withTwoComments', {snapshot});
      server.create('commentThread', 'withOneComment', {snapshot});
      server.create('commentThread', 'withTenComments', 'note', {snapshot});

      await BuildPage.visitFullPageSnapshot(urlParams);
    });

    it('displays correctly with many comments', async function () {
      const fullscreenSnapshot = BuildPage.snapshotFullscreen;
      expect(fullscreenSnapshot.collaborationPanel.isVisible).to.equal(true);
      expect(fullscreenSnapshot.commentThreads.length).to.equal(3);
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('3');
      await percySnapshot(this.test, {widths: [1280, 850, 375], darkMode: true});
    });

    it('can create a new comment reply', async function () {
      const snapshot = BuildPage.snapshotFullscreen;
      const firstThread = snapshot.commentThreads[0];

      await firstThread.focusReply();
      await firstThread.typeReply('what a great reply');
      await firstThread.submitReply();

      expect(firstThread.comments.length).to.equal(3);
    });

    it('can create a new comment thread', async function () {
      const snapshot = BuildPage.snapshotFullscreen;

      await snapshot.collaborationPanel.newComment.clickNewThreadButton();
      await snapshot.collaborationPanel.newComment.typeNewComment('wow, what a great thread');
      await snapshot.collaborationPanel.newComment.submitNewThread();

      expect(snapshot.commentThreads.length).to.equal(4);
      expect(snapshot.header.numOpenCommentThreads).to.equal('4');

      await percySnapshot(this.test, {darkMode: true});
    });

    it('can close comment threads', async function () {
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

      await percySnapshot(this.test, {darkMode: true});
    });

    // eslint-disable-next-line
    it('blocks approval of snapshot if there are open review threads on snapshot', async function () {
      const snapshot = BuildPage.snapshotFullscreen;
      await snapshot.clickApprove();
      expect(BuildPage.confirmDialog.isVisible).to.equal(true);
      expect(snapshot.approveButton.isLoading).to.equal(true);
      expect(snapshot.approveButton.isVisible).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});

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

  describe('websockets', function () {
    let commentThread;
    let fullscreenSnapshot;
    let organizationChannel;

    beforeEach(async function () {
      // Setup
      server.create('commentThread', 'withOneComment', {
        snapshot,
        createdAt: '2019-09-05T08:18:49-06:00',
      });
      commentThread = server.create('commentThread', 'withOneComment', {
        snapshot,
        createdAt: '2019-09-06T08:18:49-06:00',
      });

      // Start test and verify initial state
      await BuildPage.visitFullPageSnapshot(urlParams);
      organizationChannel =
        websocketService._socket.channels[`private-organization-${project.organization.id}`];
      fullscreenSnapshot = BuildPage.snapshotFullscreen;
      expect(fullscreenSnapshot.collaborationPanel.isVisible).to.equal(true);
      expect(fullscreenSnapshot.commentThreads.length).to.equal(2);
    });

    it('displays a new comment thread', async function () {
      // Build the JSON to receive via a websocket
      let newCommentThread = server.create('commentThread', {snapshot});
      let newComment = server.create('comment', {commentThread: newCommentThread});
      let serializedComment = server.serializerOrRegistry.serialize(newComment, {
        queryParams: {
          include: 'comment-thread,comment-thread.snapshot',
        },
      });

      // Verify initial app state
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('2');

      // Emit a mock-websocket event
      organizationChannel.emit('objectUpdated', serializedComment);

      await settled();
      expect(fullscreenSnapshot.commentThreads.length).to.equal(3);
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('3');
      await percySnapshot(this.test, {darkMode: true});
    });

    it('displays new comments', async function () {
      // Build the JSON to receive via a websocket
      let newComment = server.create('comment', {commentThread: commentThread});
      let serializedComment = server.serializerOrRegistry.serialize(newComment, {
        queryParams: {
          include: 'comment-thread',
        },
      });

      // Verify initial app state
      const firstThread = fullscreenSnapshot.commentThreads[0];
      expect(firstThread.comments.length).to.equal(1);

      // Emit a mock-websocket event
      organizationChannel.emit('objectUpdated', serializedComment);

      await settled();
      expect(firstThread.comments.length).to.equal(2);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('archives a comment thread', async function () {
      // Build the JSON to receive via a websocket
      commentThread.update({closedAt: moment().format()});
      let serializedCommentThread = server.serializerOrRegistry.serialize(commentThread);

      // Verify initial app state
      const collabPanel = fullscreenSnapshot.collaborationPanel;
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('2');
      expect(collabPanel.reviewThreads[0].isResolved).to.equal(false);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(false);

      // Emit a mock-websocket event
      organizationChannel.emit('objectUpdated', serializedCommentThread);

      await settled();
      expect(fullscreenSnapshot.header.numOpenCommentThreads).to.equal('1');
      expect(collabPanel.reviewThreads.length).to.equal(1);
      expect(collabPanel.isShowArchivedCommentsVisible).to.equal(true);

      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe('when a build is in a public project and user is not a member', function () {
    let publicOrg;
    let publicProject;
    let publicBuild;

    beforeEach(async function () {
      publicOrg = server.create('organization');
      publicProject = server.create('project', 'publiclyReadable', {organization: publicOrg});
      publicBuild = server.create('build', 'withSnapshots', {project: publicProject});
      server.create('commentThread', 'withTwoComments', {
        snapshot: publicBuild.snapshots.models[0],
      });
    });

    it('disables appropriate elements', async function () {
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
      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe('latest changed ancestor', function () {
    async function clickLatestChangedAncestorLink() {
      const header = BuildPage.snapshotFullscreen.header;
      await header.clickDropdownToggle();
      await header.dropdownOptions[header.dropdownOptions.length - 1].click();
    }

    function expectFlashMessage(message) {
      const flashMessages = findAll('.flash-message.flash-message-info');
      expect(flashMessages.length).to.equal(1);
      expect(flashMessages[0].innerText.includes(message)).to.equal(true);
    }

    function makeErrorEndpoint(statusCode, errors) {
      server.get(
        `/snapshots/${snapshot.id}/latest-changed-ancestor`,
        () => ({
          errors: errors,
        }),
        statusCode,
      );
    }

    it('navigates to latest changed ancestor snapshot', async function () {
      const parentBuild = server.create('build', 'withSnapshots', {project});
      server.get(`/snapshots/${snapshot.id}/latest-changed-ancestor`, () => {
        return parentBuild.snapshots.models.firstObject;
      });

      await BuildPage.visitFullPageSnapshot(urlParams);
      await clickLatestChangedAncestorLink();

      expect(currentURL()).to.include(parentBuild.id);
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      await percySnapshot(this.test, {darkMode: true});
    });

    it("shows error message when latest changed ancestor doesn't exist", async function () {
      makeErrorEndpoint(404, [{status: 'not_found'}]);
      await BuildPage.visitFullPageSnapshot(urlParams);
      await clickLatestChangedAncestorLink();

      expectFlashMessage('This is the earliest change we have on record for this snapshot.');
    });

    it('shows error message when latest changed ancestor returns other error', async function () {
      makeErrorEndpoint(401, [{status: 'unauthorized'}]);

      await BuildPage.visitFullPageSnapshot(urlParams);
      await clickLatestChangedAncestorLink();

      expectFlashMessage('There was a problem fetching the latest changed snapshot.');
    });

    //eslint-disable-next-line
    it('shows error message when latest changed ancestor returns incorrectly formatted error', async function () {
      makeErrorEndpoint(450, 'not a standard error format');

      await BuildPage.visitFullPageSnapshot(urlParams);
      await clickLatestChangedAncestorLink();

      expectFlashMessage('There was a problem fetching the latest changed snapshot.');
    });
  });

  it('forwards to fullscreen snapshot when hitting old route', async function () {
    await visit(
      // eslint-disable-next-line
      `/${urlParams.orgSlug}/${urlParams.projectSlug}/builds/${urlParams.buildId}/view/${urlParams.snapshotId}/${urlParams.width}?mode=${urlParams.mode}&browser=${urlParams.browser}`,
    );
    expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
  });
});

describe('Acceptance: Auto-approved Branch Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

    let organization = server.create('organization', 'withUser');
    let project = server.create('project', {name: 'auto-approved-branch build', organization});
    let build = server.create('build', 'approvedAutoBranch', {project});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('shows as auto-approved', async function () {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
  });
});

describe('Acceptance: Pending Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

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

  it('shows as pending', async function () {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');
    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open', {
      darkMode: true,
    });
  });
});

describe('Acceptance: Processing Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

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

  it('shows as processing', async function () {
    await BuildPage.visitBuild(urlParams);
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open', {
      darkMode: true,
    });
  });
});

describe('Acceptance: Failed Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();
  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

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

  it('shows as failed', async function () {
    await BuildPage.visitBuild(urlParams);
    window.Intercom = sinon.stub();
    expect(currentRouteName()).to.equal('organization.project.builds.build.index');

    await percySnapshot(this.test.fullTitle() + ' on the build page', {darkMode: true});
    await BuildPage.toggleBuildInfoDropdown();
    await percySnapshot(this.test.fullTitle() + ' on the build page with build info open', {
      darkMode: true,
    });
    await BuildPage.clickShowSupportLink();
    expect(window.Intercom).to.have.been.calledWith('show');
  });
});

describe('Acceptance: Demo Project Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

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

  it('renders the tooltips', async function () {
    await BuildPage.visitBuild(urlParams);

    const tooltipElement = await findAll('.ember-attacher').firstObject;
    expect(BuildPage.demoTooltips.length).to.equal(5);
    // Anchors on snapshot viewers should be visible
    // This line checks that the index param is being passed correctly
    expect(BuildPage.demoTooltips[3].isAnchorVisible).to.equal(true);

    await BuildPage.demoTooltips.objectAt(0).clickAnchor();
    expect(attacherIsVisible(tooltipElement)).to.equal(true);
  });

  // This test is flaky on CI
  it.skip('moves on to the next tooltip when clicking next', async function () {
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

  it('hides all tooltips and all anchors when all are dismissed', async function () {
    await BuildPage.visitBuild(urlParams);

    expect(BuildPage.demoTooltips.length).to.equal(5);

    await BuildPage.demoTooltips.objectAt(0).clickAnchor();
    await BuildPage.demoTooltips.objectAt(0).clickDismissAll();

    // verify that all tooltips were dismissed
    BuildPage.demoTooltips.forEach(demoTooltip => {
      expect(demoTooltip.isAnchorVisible).to.equal(false, 'anchor should be hidden');
    });
  });
});
