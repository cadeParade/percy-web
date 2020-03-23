/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import SnapshotGroup from 'percy-web/tests/pages/components/snapshot-group';
import {SNAPSHOT_APPROVED_STATE} from 'percy-web/models/snapshot';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';

describe('Integration: SnapshotGroup', function () {
  setupRenderingTest('snapshot-group', {
    integration: true,
  });

  let snapshots;
  let approvedSnapshots;

  beforeEach(function () {
    setupFactoryGuy(this);

    snapshots = makeList('snapshot', 5, 'withComparisons', {fingerprint: 'fingerprint'});
    approvedSnapshots = makeList('snapshot', 5, 'withComparisons', 'approved', {
      fingerprint: 'fingerprint',
    });
    const build = make('build', 'finished');
    const browser = make('browser');
    build.set('snapshots', snapshots);
    const stub = sinon.stub();

    this.setProperties({
      stub,
      snapshots,
      build,
      browser,
      userSelectedWidth: null,
      isBuildApprovable: true,
    });
  });

  describe('width switcher', function () {
    beforeEach(async function () {
      // set the widest width comparison to have no diffs to have interesting test behavior.
      this.get('snapshots').forEach(snapshot => {
        snapshot.get('comparisons').findBy('width', 1024).set('diffRatio', 0);
      });
    });

    // eslint-disable-next-line
    it('shows widest width with diff as active by default when some comparisons have diffs', async function() {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);

      expect(SnapshotGroup.header.widthSwitcher.buttons[0].isActive).to.equal(false);
      expect(SnapshotGroup.header.widthSwitcher.buttons[1].isActive).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('updates active button when clicked', async function () {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeBrowser={{browser}}
        @updateActiveSnapshotBlockId={{stub}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);

      expect(SnapshotGroup.header.widthSwitcher.buttons[1].isActive).to.equal(true);
      await SnapshotGroup.header.widthSwitcher.buttons[0].click();
      expect(SnapshotGroup.header.widthSwitcher.buttons[0].isActive).to.equal(true);
      expect(SnapshotGroup.header.widthSwitcher.buttons[1].isActive).to.equal(false);
    });
  });

  describe('full screen toggle button', function () {
    beforeEach(async function () {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);
    });

    it('displays', async function () {
      expect(SnapshotGroup.header.isFullScreenToggleVisible).to.equal(true);
    });
  });

  describe('expand/collapse', function () {
    beforeEach(async function () {
      this.set('activeSnapshotBlockId', null);

      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeSnapshotBlockId={{activeSnapshotBlockId}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);
    });

    it('is expanded by default when the group is completely unapproved', async function () {
      expect(SnapshotGroup.isExpanded).to.equal(true);
    });

    it('is expanded by default when the group is partially approved', async function () {
      this.set('snapshots.firstObject.reviewState', SNAPSHOT_APPROVED_STATE);
      expect(SnapshotGroup.isExpanded).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('is collapsed by default when the group is approved', async function () {
      this.set('snapshots', approvedSnapshots);
      expect(SnapshotGroup.isExpanded).to.equal(false);
    });

    it('is expanded when build is approved', async function () {
      this.set('snapshots', approvedSnapshots);
      this.set('build.reviewState', 'approved');

      expect(SnapshotGroup.isExpanded).to.equal(true);
    });

    //eslint-disable-next-line
    it("is expanded when activeSnapshotBlockId is equal to the group's fingerprint", async function() {
      this.set('snapshots', approvedSnapshots);
      this.set('activeSnapshotBlockId', snapshots.get('firstObject.fingerprint'));
      expect(SnapshotGroup.isExpanded).to.equal(true);
    });

    it('expands when the group is collapsed and a user clicks the header ', async function () {
      this.set('snapshots', approvedSnapshots);
      await SnapshotGroup.header.click();
      expect(SnapshotGroup.isExpanded).to.equal(true);
    });
  });

  describe('showing all snapshots in the group', function () {
    beforeEach(async function () {
      let unapprovedSnapshots = makeList('snapshot', 3, 'withComparisons', {
        build: this.get('build'),
      });
      let approvedSnapshots = makeList('snapshot', 2, 'withComparisons', 'approved', {
        build: this.get('build'),
      });
      let snapshots = unapprovedSnapshots.concat(approvedSnapshots);
      this.set('snapshots', snapshots);

      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeSnapshotBlockId={{activeSnapshotBlockId}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);
    });

    it('should show all snapshots', async function () {
      await SnapshotGroup.header.toggleShowAllSnapshots();
      expect(SnapshotGroup.snapshots.length).to.equal(5);
      expect(SnapshotGroup.header.widthSwitcher.isVisible).to.equal(false);
      expect(SnapshotGroup.header.isFullScreenToggleVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('snapshots should be in the correct order', async function () {
      const snapshots = this.get('snapshots');
      await SnapshotGroup.header.toggleShowAllSnapshots();
      SnapshotGroup.snapshots.forEach((snapshot, i) => {
        expect(snapshot.name).to.equal(snapshots[i].name);
      });
    });

    it('should hide all snapshots', async function () {
      await SnapshotGroup.header.toggleShowAllSnapshots();
      await SnapshotGroup.header.toggleShowAllSnapshots();
      expect(SnapshotGroup.snapshots.length).to.equal(0);
      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe('diff toggling', function () {
    beforeEach(async function () {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
        @updateActiveSnapshotBlockId={{stub}}
      />`);
    });

    it('toggles cover image diff when clicking', async function () {
      expect(SnapshotGroup.isDiffImageVisible).to.equal(true);
      await SnapshotGroup.clickDiffImage();
      expect(SnapshotGroup.isDiffImageVisible).to.equal(false);
    });

    describe('when showing all snapshots for a group', function () {
      it('shows diffs for all snapshots by default', async function () {
        expect(SnapshotGroup.isDiffImageVisible).to.equal(true);
        await SnapshotGroup.toggleShowAllSnapshots();
        SnapshotGroup.snapshots.forEach(snapshot => {
          expect(snapshot.isDiffImageVisible).to.equal(true);
        });
      });

      it('toggles diff image for individual snapshots', async function () {
        await SnapshotGroup.toggleShowAllSnapshots();
        await SnapshotGroup.snapshots[0].clickDiffImage();
        SnapshotGroup.snapshots.forEach((snapshot, i) => {
          const expectedValue = i === 0 ? false : true;
          expect(
            snapshot.isDiffImageVisible,
            `Snapshot ${i} should isDiffVisible = ${expectedValue}`,
          ).to.equal(expectedValue);
        });
      });

      it('displays diff image in same state when collapsing all snapshots', async function () {
        await SnapshotGroup.clickDiffImage();
        expect(SnapshotGroup.isDiffImageVisible).to.equal(false);

        await SnapshotGroup.toggleShowAllSnapshots();
        await SnapshotGroup.toggleShowAllSnapshots();
        expect(SnapshotGroup.isDiffImageVisible).to.equal(false);
      });
    });
  });

  describe('when multiple snapshots in the group have comments', function () {
    let snapshotsWithComments;
    beforeEach(async function () {
      snapshotsWithComments = makeList('snapshot', 2, 'withComparisons', 'withComments', {
        fingerprint: 'fingerprint',
      });
      const snapshotsWithNoComments = makeList('snapshot', 3, 'withComparisons', {
        fingerprint: 'fingerprint',
      });
      const snapshots = snapshotsWithNoComments.concat(snapshotsWithComments);
      this.setProperties({snapshots});
    });

    it('shows multiple snapshots as "cover" snapshots', async function () {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);

      expect(SnapshotGroup.snapshots.length).to.equal(2);
      await percySnapshot(this.test, {darkMode: true});
    });

    // eslint-disable-next-line
    it('shows unreviewed snapshot without comment before approved snapshot with open comment', async function() {
      snapshotsWithComments.forEach(snapshot => {
        snapshot.setProperties({
          reviewState: 'approved',
          reviewStateReason: 'user_approved',
        });
      });

      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);

      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe('comment button', function () {
    beforeEach(async function () {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeSnapshotBlockId={{activeSnapshotBlockId}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);
    });

    it('expands all snapshots and shows comment panel on first snapshot', async function () {
      await SnapshotGroup.header.clickCommentButton();
      const firstSnapshot = SnapshotGroup.snapshots[0];
      const secondSnapshot = SnapshotGroup.snapshots[1];

      expect(SnapshotGroup.snapshots.length).to.equal(5);
      expect(firstSnapshot.collaborationPanel.isVisible).to.equal(true);
      expect(secondSnapshot.collaborationPanel.isVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('allows collaboration panel toggle on first snapshot', async function () {
      await SnapshotGroup.header.clickCommentButton();
      const firstSnapshot = SnapshotGroup.snapshots[0];
      expect(firstSnapshot.collaborationPanel.isVisible).to.equal(true);
      await firstSnapshot.header.toggleCommentSidebar();
      expect(firstSnapshot.collaborationPanel.isVisible).to.equal(false);
    });

    it('allows comment panel toggle after all snapshots expanded', async function () {
      await SnapshotGroup.header.toggleShowAllSnapshots();
      const firstSnapshot = SnapshotGroup.snapshots[0];

      expect(firstSnapshot.collaborationPanel.isVisible).to.equal(false);
      await SnapshotGroup.header.clickCommentButton();
      expect(firstSnapshot.collaborationPanel.isVisible).to.equal(true);
    });
  });

  describe('group state', function () {
    beforeEach(async function () {
      await render(hbs`<SnapshotGroup
        @snapshots={{snapshots}}
        @build={{build}}
        @userSelectedWidth={{userSelectedWidth}}
        @activeSnapshotBlockId={{activeSnapshotBlockId}}
        @updateActiveSnapshotBlockId={{stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{isBuildApprovable}}
      />`);
    });

    it('is unreviewed by default', async function () {
      const snapshots = makeList('snapshot', 2, 'withComparisons', {fingerprint: 'unreviewed'});
      this.setProperties({snapshots});
      expect(SnapshotGroup.approveButton.isUnapproved).to.equal(true);
      expect(SnapshotGroup.header.rejectedBadge.isVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('shows approved when all snapshots are approved', async function () {
      const snapshots = makeList('snapshot', 2, 'withComparisons', 'approved', {
        fingerprint: 'approved',
      });
      this.setProperties({snapshots});
      expect(SnapshotGroup.approveButton.isApproved).to.equal(true);
      expect(SnapshotGroup.header.rejectedBadge.isVisible).to.equal(false);
      await percySnapshot(this.test, {darkMode: true});
    });

    it('shows rejected when one snapshot is rejected', async function () {
      const rejectedSnapshots = makeList('snapshot', 1, 'withComparisons', 'rejected', {
        fingerprint: 'mixed',
      });
      const unreviewedSnapshots = makeList('snapshot', 2, 'withComparisons', {
        fingerprint: 'mixed',
      });
      this.setProperties({snapshots: rejectedSnapshots.concat(unreviewedSnapshots)});
      expect(SnapshotGroup.approveButton.isUnapproved).to.equal(true);
      expect(SnapshotGroup.header.rejectedBadge.isVisible).to.equal(true);
    });
  });
});
