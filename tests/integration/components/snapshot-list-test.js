/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {percySnapshot} from 'ember-percy';
import SnapshotList from 'percy-web/tests/pages/components/snapshot-list';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {initialize as initializeEmberKeyboard} from 'ember-keyboard';

describe('Integration: SnapshotList', function() {
  setupRenderingTest('snapshot-list', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    SnapshotList.setContext(this);
  });

  describe('when shouldDeferRendering is true', function() {
    const numSnapshots = 10;

    beforeEach(async function() {
      const stub = sinon.stub();
      const build = make('build', 'finished');
      const browser = make('browser');

      const singleSnapshotsChanged = makeList('snapshot', numSnapshots, 'withComparisons', {build});
      const group = makeList('snapshot', 2, 'withComparisons', {build, fingerprint: 'aaa'});

      this.setProperties({
        snapshotsChanged: singleSnapshotsChanged.concat(group),
        build,
        stub,
        browser,
        shouldDeferRendering: true,
      });

      await this.render(hbs`{{snapshot-list
        snapshotsChanged=snapshotsChanged
        build=build
        createReview=stub
        showSnapshotFullModalTriggered=stub
        activeBrowser=browser
        shouldDeferRendering=shouldDeferRendering
        toggleUnchangedSnapshotsVisible=stub
        isBuildApprovable=true
      }}`);
    });

    it('renders snapshot header placeholder', async function() {
      expect(SnapshotList.snapshotBlocks.length).to.equal(numSnapshots + 1);
      SnapshotList.snapshotBlocks.forEach(block => {
        expect(block.isLazyRenderHeaderVisible).to.equal(true);
      });
      await percySnapshot(this.test);
    });
  });

  describe('keyboard nav behavior', function() {
    beforeEach(async function() {
      initializeEmberKeyboard();
      const stub = sinon.stub();
      const build = make('build', 'finished');
      const browser = make('browser');

      const snapshotsChanged = makeList('snapshot', 1, 'withComparisons', {build});
      const snapshotsUnchanged = makeList('snapshot', 3, 'withNoDiffs', {build});
      const approvedGroup1 = makeList('snapshot', 5, 'approved', 'withComparisons', {
        build,
        fingerprint: 'approvedGroup1',
      });
      const approvedGroup2 = makeList('snapshot', 2, 'approved', 'withComparisons', {
        build,
        fingerprint: 'approvedGroup2',
      });
      const unapprovedGroup = makeList('snapshot', 3, 'withComparisons', {
        build,
        fingerprint: 'unapprovedGroup',
      });

      const allSnapshotsChanged = snapshotsChanged.concat(
        approvedGroup1,
        approvedGroup2,
        unapprovedGroup,
      );

      this.setProperties({
        build,
        snapshotsChanged: allSnapshotsChanged,
        snapshotsUnchanged,
        stub,
        browser,
        isKeyboardNavEnabled: true,
        isUnchangedSnapshotsVisible: false,
      });

      await this.render(hbs`{{snapshot-list
        snapshotsChanged=snapshotsChanged
        build=build
        createReview=stub
        showSnapshotFullModalTriggered=stub
        isKeyboardNavEnabled=isKeyboardNavEnabled
        activeBrowser=browser
        toggleUnchangedSnapshotsVisible=stub
        isUnchangedSnapshotsVisible=isUnchangedSnapshotsVisible
        snapshotsUnchanged=snapshotsUnchanged
        isBuildApprovable=true
      }}`);
    });

    it('automatically expands collapsed snapshot blocks if focused', async function() {
      this.set('isUnchangedSnapshotsVisible', true);
      const firstApprovedGroup = SnapshotList.snapshotBlocks[2].snapshotGroup;
      const secondApprovedGroup = SnapshotList.snapshotBlocks[3].snapshotGroup;
      const firstNoDiffSnapshot = SnapshotList.snapshotBlocks[4].snapshotViewer;
      const secondNoDiffSnapshot = SnapshotList.snapshotBlocks[5].snapshotViewer;
      const thirdNoDiffSnapshot = SnapshotList.snapshotBlocks[6].snapshotViewer;

      // Manaully click the first approved snapshot group and first unchanged snapshot.
      // Clicking on these objects mean that they should not ever collapse with arrow nav.
      // The group was clicked last, so that is where the active snapshot starts.
      await firstNoDiffSnapshot.header.expandSnapshot();
      await firstApprovedGroup.header.expandGroup();

      expect(firstApprovedGroup.isExpanded).to.equal(true);
      expect(secondApprovedGroup.isExpanded).to.equal(false);
      expect(firstNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(true);
      expect(secondNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);
      expect(thirdNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);

      // Arrow to second approved group.
      // Since we clicked the first group, it's snapshots should be visible.
      // Since we arrowed to the second group, it's snapshots should be visible.
      // Since we clicked the first unchanged snapshot, it's comparisons should be visible.
      await SnapshotList.typeDownArrow();

      expect(firstApprovedGroup.isExpanded).to.equal(true);
      expect(secondApprovedGroup.isExpanded).to.equal(true);
      expect(firstNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(true);
      expect(secondNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);
      expect(thirdNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);

      // Arrow to first unchanged snapshot.
      await SnapshotList.typeDownArrow();

      // We clicked on the first group, it's snapshots should always visible.
      // We arrowed to and away from the second group, so its snapshots should now be hidden.
      // We arrowed to the first unchanged snapshots, and it was already expanded,
      // so its comparisons should be visible.
      expect(firstApprovedGroup.isExpanded).to.equal(true);
      expect(secondApprovedGroup.isExpanded).to.equal(false);
      expect(firstNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(true);
      expect(secondNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);
      expect(thirdNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);

      // Arrow to the second unchanged snapshot.
      await SnapshotList.typeDownArrow();

      // We clicked on the first group, its snapshots should always visible.
      // We arrowed to and away from the second group, so its snapshots should now be hidden.
      // We arrowed to and away from the first unchanged snapshots,
      // so its snapshots should now be hidden
      // We arrowed to the second unchanged snapshot, so its comparisons should now be visible.
      expect(firstApprovedGroup.isExpanded).to.equal(true);
      expect(secondApprovedGroup.isExpanded).to.equal(false);
      expect(firstNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(true);
      expect(secondNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(true);
      expect(thirdNoDiffSnapshot.isUnchangedComparisonsVisible).to.equal(false);
    });

    it('focuses snapshots on arrow presses', async function() {
      const numRenderedSnapshots = SnapshotList.snapshotBlocks.length;
      // 4 = 1 unapproved group, 1 unapproved snapshot, 2 approved groups
      expect(numRenderedSnapshots).to.equal(4);

      const firstSnapshotBlock = SnapshotList.snapshotBlocks[0];
      const secondSnapshotBlock = SnapshotList.snapshotBlocks[1];
      const lastSnapshotBlock = SnapshotList.snapshotBlocks[numRenderedSnapshots - 1];

      // select first snapshotBlock
      await SnapshotList.typeDownArrow();
      expect(firstSnapshotBlock.isFocused).to.equal(true);
      expect(secondSnapshotBlock.isFocused).to.equal(false);
      expect(lastSnapshotBlock.isFocused).to.equal(false);

      // select second snapshotBlock
      await SnapshotList.typeDownArrow();
      expect(firstSnapshotBlock.isFocused).to.equal(false);
      expect(secondSnapshotBlock.isFocused).to.equal(true);
      expect(lastSnapshotBlock.isFocused).to.equal(false);

      // select first snapshotBlock
      await SnapshotList.typeUpArrow();
      expect(firstSnapshotBlock.isFocused).to.equal(true);
      expect(secondSnapshotBlock.isFocused).to.equal(false);
      expect(lastSnapshotBlock.isFocused).to.equal(false);

      // wrap around to select last snapshotBlock
      await SnapshotList.typeUpArrow();
      expect(firstSnapshotBlock.isFocused).to.equal(false);
      expect(secondSnapshotBlock.isFocused).to.equal(false);
      expect(lastSnapshotBlock.isFocused).to.equal(true);
      await percySnapshot(this.test);

      // wrap around to select first snapshotBlock
      await SnapshotList.typeDownArrow();
      expect(firstSnapshotBlock.isFocused).to.equal(true);
      expect(secondSnapshotBlock.isFocused).to.equal(false);
      expect(lastSnapshotBlock.isFocused).to.equal(false);
    });

    it('does not send keyboard actions when isKeyboardNavEnabled is false', async function() {
      const numRenderedSnapshots = SnapshotList.snapshotBlocks.length;
      this.set('isKeyboardNavEnabled', false);
      await SnapshotList.typeDownArrow();
      expect(SnapshotList.snapshotBlocks[0].isFocused).to.equal(false);
      expect(SnapshotList.snapshotBlocks[1].isFocused).to.equal(false);
      expect(SnapshotList.snapshotBlocks[numRenderedSnapshots - 1].isFocused).to.equal(false);
    });
  });

  describe('ordering', function() {
    const unapprovedSingleSnapshotsWithCommentsTitle = 'unapproved single snapshot with comments';
    const unapprovedSingleSnapshotsWithoutCommentsTitle =
      'unapproved single snapshot without comments';
    const approvedSingleSnapshotsWithCommentsTitle = 'approved single snapshot with comments';
    const approvedSingleSnapshotsWithoutCommentsTitle = 'approved single snapshot without comments';

    beforeEach(async function() {
      const stub = sinon.stub();
      const build = make('build', 'finished', {totalSnapshots: 11});
      const browser = make('browser');

      const approvedGroupWithComments = makeList(
        'snapshot',
        2,
        'approved',
        'withComparisons',
        'withComments',
        {
          build,
          fingerprint: 'approvedGroupWithComments',
        },
      );

      const approvedGroupWithoutComments = makeList('snapshot', 3, 'approved', 'withComparisons', {
        build,
        fingerprint: 'approvedGroupWithoutComments',
      });

      const unapprovedGroupWithComments = makeList(
        'snapshot',
        4,
        'withComparisons',
        'withComments',
        {
          build,
          fingerprint: 'unapprovedGroupWithComments',
        },
      );

      const unapprovedGroupWithoutComments = makeList('snapshot', 5, 'withComparisons', {
        build,
        fingerprint: 'unapprovedGroupWithoutComments',
      });

      const unapprovedSingleSnapshotsWithComments = makeList(
        'snapshot',
        1,
        'withComparisons',
        'withComments',
        {build, name: unapprovedSingleSnapshotsWithCommentsTitle},
      );

      const unapprovedSingleSnapshotsWithoutComments = makeList('snapshot', 1, 'withComparisons', {
        build,
        name: unapprovedSingleSnapshotsWithoutCommentsTitle,
      });

      const approvedSingleSnapshotsWithComments = makeList(
        'snapshot',
        1,
        'approved',
        'withComparisons',
        'withComments',
        {build, name: approvedSingleSnapshotsWithCommentsTitle},
      );

      const approvedSingleSnapshotsWithoutComments = makeList(
        'snapshot',
        1,
        'approved',
        'withComparisons',
        {build, name: approvedSingleSnapshotsWithoutCommentsTitle},
      );

      const snapshotsChanged = unapprovedSingleSnapshotsWithoutComments.concat(
        approvedSingleSnapshotsWithoutComments,
        approvedSingleSnapshotsWithComments,
        unapprovedSingleSnapshotsWithComments,
        approvedGroupWithoutComments,
        unapprovedGroupWithoutComments,
        approvedGroupWithComments,
        unapprovedGroupWithComments,
      );

      this.setProperties({snapshotsChanged, build, stub, browser, numSnapshotsUnchanged: 0});

      await this.render(hbs`{{snapshot-list
        snapshotsChanged=snapshotsChanged
        snapshotsUnchanged=snapshotsUnchanged
        build=build
        createReview=stub
        showSnapshotFullModalTriggered=stub
        activeBrowser=browser
        toggleUnchangedSnapshotsVisible=stub
        isBuildApprovable=true
      }}`);
    });

    it('orders individual and grouped snapshots correctly', async function() {
      function expectIsGroup(block) {
        expect(block.isGroup).to.equal(true);
      }

      function expectIsSnapshot(block) {
        expect(block.isSnapshot).to.equal(true);
      }

      function expectSnapshotName(block, name) {
        expect(block.snapshotViewer.name).to.equal(name);
      }

      function expectGroupSnapshotCount(block, count) {
        if (block.isApproved) {
          expect(block.snapshotGroup.header.groupApprovalButton.approvedText).to.include(count);
        } else {
          expect(block.snapshotGroup.approveButton.buttonText).to.include(count);
        }
      }

      expect(SnapshotList.snapshotBlocks.length).to.equal(8);

      const firstBlock = SnapshotList.snapshotBlocks[0];
      expectIsGroup(firstBlock);
      expectGroupSnapshotCount(firstBlock, '4');

      const secondBlock = SnapshotList.snapshotBlocks[1];
      expectIsSnapshot(secondBlock);
      expectSnapshotName(secondBlock, unapprovedSingleSnapshotsWithCommentsTitle);

      const thirdBlock = SnapshotList.snapshotBlocks[2];
      expectIsGroup(thirdBlock);
      expectGroupSnapshotCount(thirdBlock, '5');

      const fourthBlock = SnapshotList.snapshotBlocks[3];
      expectIsSnapshot(fourthBlock);
      expectSnapshotName(fourthBlock, unapprovedSingleSnapshotsWithoutCommentsTitle);

      const fifthBlock = SnapshotList.snapshotBlocks[4];
      expectIsGroup(fifthBlock);
      expectGroupSnapshotCount(fifthBlock, '2');

      const sixthBlock = SnapshotList.snapshotBlocks[5];
      expectIsSnapshot(sixthBlock);
      expectSnapshotName(sixthBlock, approvedSingleSnapshotsWithCommentsTitle);

      const seventhBlock = SnapshotList.snapshotBlocks[6];
      expectIsGroup(seventhBlock);
      expectGroupSnapshotCount(seventhBlock, '3');

      const eighthBlock = SnapshotList.snapshotBlocks[7];
      expectIsSnapshot(eighthBlock);
      expectSnapshotName(eighthBlock, approvedSingleSnapshotsWithoutCommentsTitle);

      await percySnapshot(this.test);
    });
  });
});
