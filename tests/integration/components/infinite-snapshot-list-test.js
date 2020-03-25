/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import SnapshotList from 'percy-web/tests/pages/components/snapshot-list';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {initialize as initializeEmberKeyboard} from 'ember-keyboard';
import {render} from '@ember/test-helpers';
import setupLaunchDarkly from 'percy-web/tests/helpers/setup-launch-darkly';
import metadataSort from 'percy-web/lib/metadata-sort';

function createGroup(snapshots) {
  return snapshots.map(createSortMetadataItem);
}

function createSortMetadataItem(snapshot) {
  return {
    id: snapshot.id,
    type: 'snapshot',
    attributes: {
      'review-state-reason': snapshot.reviewStateReason,
    },
  };
}

function createSortItemArray(blocks) {
  return blocks.map((block, i) => {
    if (block.length) {
      return {
        index: i,
        type: 'group',
        items: createGroup(block),
      };
    } else {
      return {
        index: i,
        type: 'snapshot',
        items: [createSortMetadataItem(block)],
      };
    }
  });
}

describe('Integration: InfiniteSnapshotList', function () {
  const hooks = setupRenderingTest('snapshot-list', {
    integration: true,
  });

  setupLaunchDarkly(hooks);

  beforeEach(function () {
    setupFactoryGuy(this);
    this.withVariation('snapshot-sort-api', true);
  });

  describe('keyboard nav behavior', function () {
    beforeEach(async function () {
      initializeEmberKeyboard();
      const stub = sinon.stub();
      const build = make('build', 'finished');
      const browser = make('browser');

      const snapshotChanged = make('snapshot', 'withComparisons', {build});
      const approvedSnapshot = make('snapshot', 'approved', 'withComparisons', {build});
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

      const store = this.owner.lookup('service:store');
      const sortMetadata = metadataSort.create({
        store,
        metadataSort: [
          {
            browser_family_slug: 'firefox',
            default_browser_family_slug: true,
            items: createSortItemArray([
              unapprovedGroup,
              snapshotChanged,
              approvedGroup1,
              approvedGroup2,
              approvedSnapshot,
            ]),
          },
        ],
      });

      build.set('sortMetadata', sortMetadata);
      this.setProperties({
        build,
        orderItems: sortMetadata.orderItemsForBrowser('firefox'),
        stub,
        browser,
        isUnchangedSnapshotsVisible: false,
      });

      await render(hbs`<InfiniteSnapshotList
        @orderItems={{orderItems}}
        @build={{build}}
        @activeBrowser={{browser}}
        @toggleUnchangedSnapshotsVisible={{stub}}
        @isBuildApprovable={{true}}
        @page={{1}}
      />`);
    });

    it('automatically expands collapsed snapshot blocks if focused', async function () {
      const firstApprovedGroup = SnapshotList.snapshotBlocks[2].snapshotGroup;
      const secondApprovedGroup = SnapshotList.snapshotBlocks[3].snapshotGroup;
      const approvedSnapshot = SnapshotList.snapshotBlocks[4].snapshotViewer;

      // Manaully click the first approved snapshot group.
      // Clicking on this object means that it should not ever collapse with arrow nav.
      // The group was clicked last, so that is where the active snapshot starts.
      await firstApprovedGroup.header.expandGroup();

      expect(firstApprovedGroup.isExpanded, 'a').to.equal(true);
      expect(secondApprovedGroup.isExpanded, 'b').to.equal(false);
      expect(approvedSnapshot.isExpanded, 'c').to.equal(false);

      // Arrow to second approved group.
      // Since we clicked the first group, it's snapshots should be visible.
      // Since we arrowed to the second group, it's snapshots should be visible.
      await SnapshotList.typeDownArrow();

      expect(firstApprovedGroup.isExpanded, 'd').to.equal(true);
      expect(secondApprovedGroup.isExpanded, 'e').to.equal(true);
      expect(approvedSnapshot.isExpanded, 'f').to.equal(false);

      // Arrow to approved snapshot.
      await SnapshotList.typeDownArrow();

      // We clicked on the first group, it's snapshots should always visible.
      // We arrowed to and away from the second group, so its snapshots should now be hidden.
      // We arrowed to the first approved snapshot, so its comparisons should be visible.
      expect(firstApprovedGroup.isExpanded, 'g').to.equal(true);
      expect(secondApprovedGroup.isExpanded, 'h').to.equal(false);
      expect(approvedSnapshot.isExpanded, 'i').to.equal(true);
    });

    it('focuses snapshots on arrow presses', async function () {
      const numRenderedSnapshots = SnapshotList.snapshotBlocks.length;
      // 5 = 1 unapproved group, 1 unapproved snapshot, 2 approved groups, 1 approved snapshot
      expect(numRenderedSnapshots).to.equal(5);

      const firstSnapshotBlock = SnapshotList.snapshotBlocks[0];
      const secondSnapshotBlock = SnapshotList.snapshotBlocks[1];
      const lastSnapshotBlock = SnapshotList.snapshotBlocks[numRenderedSnapshots - 1];

      // select first snapshotBlock
      await SnapshotList.typeDownArrow();
      expect(firstSnapshotBlock.isFocused, 'a').to.equal(true);
      expect(secondSnapshotBlock.isFocused, 'b').to.equal(false);
      expect(lastSnapshotBlock.isFocused, 'c').to.equal(false);

      // select second snapshotBlock
      await SnapshotList.typeDownArrow();
      expect(firstSnapshotBlock.isFocused, 'd').to.equal(false);
      expect(secondSnapshotBlock.isFocused, 'e').to.equal(true);
      expect(lastSnapshotBlock.isFocused, 'f').to.equal(false);

      // select first snapshotBlock
      await SnapshotList.typeUpArrow();
      expect(firstSnapshotBlock.isFocused, 'g').to.equal(true);
      expect(secondSnapshotBlock.isFocused, 'h').to.equal(false);
      expect(lastSnapshotBlock.isFocused, 'i').to.equal(false);
    });
  });

  describe('ordering', function () {
    const oneTitle = 'one';
    const twoTitle = 'two';
    const threeTitle = 'three';
    let build;
    let snapshotOne;
    let snapshotTwo;
    let snapshotThree;
    let groupedSnapshots;
    let sortMetadata;

    beforeEach(async function () {
      const stub = sinon.stub();
      build = make('build', 'finished', {totalSnapshots: 11});

      snapshotOne = make('snapshot', 'withTwoBrowsers', {build, title: oneTitle});
      snapshotTwo = make('snapshot', 'withTwoBrowsers', 'approved', {build, title: twoTitle});
      snapshotThree = make('snapshot', 'withTwoBrowsers', 'rejected', {build, title: threeTitle});
      groupedSnapshots = makeList('snapshot', 3, 'withTwoBrowsers', {
        build,
        fingerprint: 'foo',
      });

      const store = this.owner.lookup('service:store');
      sortMetadata = metadataSort.create({
        store,
        metadataSort: [
          {
            browser_family_slug: 'firefox',
            default_browser_family_slug: true,
            items: createSortItemArray([snapshotTwo, groupedSnapshots, snapshotThree, snapshotOne]),
          },
          {
            browser_family_slug: 'chrome',
            default_browser_family_slug: false,
            items: createSortItemArray([groupedSnapshots, snapshotOne, snapshotTwo, snapshotThree]),
          },
        ],
      });

      build.set('sortMetadata', sortMetadata);
      this.setProperties({build, stub});
    });

    function expectIsGroup(block) {
      expect(block.isGroup).to.equal(true);
    }

    function expectIsSnapshot(block) {
      expect(block.isSnapshot).to.equal(true);
    }

    it('orders snapshots by metadata sort data for a browser', async function () {
      const browser = make('browser');
      const orderItems = sortMetadata.orderItemsForBrowser('firefox');
      this.setProperties({
        browser,
        orderItems,
      });

      await render(hbs`<InfiniteSnapshotList
        @orderItems={{orderItems}}
        @build={{build}}
        @toggleUnchangedSnapshotsVisible={{action stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{true}}
        @page={{1}}
      />`);

      let first = SnapshotList.snapshotBlocks[0];
      let second = SnapshotList.snapshotBlocks[1];
      let third = SnapshotList.snapshotBlocks[2];
      let fourth = SnapshotList.snapshotBlocks[3];

      expect(SnapshotList.snapshotBlocks.length).to.equal(4);
      expectIsSnapshot(first);
      expectIsGroup(second);
      expectIsSnapshot(third);
      expectIsSnapshot(fourth);

      expect(first.snapshotViewer.name).to.equal(snapshotTwo.name);
      expect(second.snapshotGroup.name).to.equal('3 matching changes');
      expect(third.snapshotViewer.name).to.equal(snapshotThree.name);
      expect(fourth.snapshotViewer.name).to.equal(snapshotOne.name);

      await percySnapshot(this.test);
    });

    it('orders snapshots by metadata sort data for other browser', async function () {
      const chromeBrowser = make('browser', 'chrome');
      const orderItems = sortMetadata.orderItemsForBrowser('chrome');
      this.setProperties({
        orderItems,
        browser: chromeBrowser,
      });

      await render(hbs`<InfiniteSnapshotList
        @orderItems={{orderItems}}
        @build={{build}}
        @toggleUnchangedSnapshotsVisible={{action stub}}
        @activeBrowser={{browser}}
        @isBuildApprovable={{true}}
        @page={{1}}
      />`);

      let first = SnapshotList.snapshotBlocks[0];
      let second = SnapshotList.snapshotBlocks[1];
      let third = SnapshotList.snapshotBlocks[2];
      let fourth = SnapshotList.snapshotBlocks[3];

      expect(SnapshotList.snapshotBlocks.length).to.equal(4);
      expectIsGroup(first);
      expectIsSnapshot(second);
      expectIsSnapshot(third);
      expectIsSnapshot(fourth);

      expect(first.snapshotGroup.name).to.equal('3 matching changes');
      expect(second.snapshotViewer.name).to.equal(snapshotOne.name);
      expect(third.snapshotViewer.name).to.equal(snapshotTwo.name);
      expect(fourth.snapshotViewer.name).to.equal(snapshotThree.name);

      await percySnapshot(this.test);
    });
  });
});
