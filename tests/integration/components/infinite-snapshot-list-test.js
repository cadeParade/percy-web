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

describe('Integration: InfiniteSnapshotList', function() {
  const hooks = setupRenderingTest('snapshot-list', {
    integration: true,
  });

  setupLaunchDarkly(hooks);

  beforeEach(function() {
    setupFactoryGuy(this);
    this.withVariation('snapshot-sort-api', true);
  });

  describe.skip('when shouldDeferRendering is true', function() {
    const numSnapshots = 10;

    beforeEach(async function() {
      const stub = sinon.stub();
      const build = make('build', 'finished');
      const browser = make('browser');

      const singleSnapshotsChanged = makeList('snapshot', numSnapshots, 'withComparisons', {build});
      const group = makeList('snapshot', 2, 'withComparisons', {build, fingerprint: 'aaa'});
      const orderItems = [{index: 0, type: 'group', 'snapshot-ids': [group.mapBy('id')]}].concat(
        singleSnapshotsChanged.map((snapshot, i) => {
          return {index: i + 1, type: 'snapshot', 'snapshot-id': snapshot.id};
        }),
      );

      this.setProperties({
        orderItems,
        build,
        stub,
        browser,
        shouldDeferRendering: true,
      });

      await render(hbs`<InfiniteSnapshotList
        @orderItems={{orderItems}}
        @build={{build}}
        @activeBrowser={{browser}}
        @shouldDeferRendering={{shouldDeferRendering}}
        @toggleUnchangedSnapshotsVisible={{stub}}
        @isBuildApprovable={{true}}
      />`);
    });

    it('renders snapshot header placeholder', async function() {
      expect(SnapshotList.snapshotBlocks.length).to.equal(numSnapshots + 1);
      SnapshotList.snapshotBlocks.forEach(block => {
        expect(block.isLazyRenderHeaderVisible).to.equal(true);
      });
      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe.skip('keyboard nav behavior', function() {
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

      const orderItems = []
        .concat([{index: 0, type: 'group', 'snapshot-ids': unapprovedGroup.mapBy('id')}])
        .concat(
          snapshotsChanged.map((snapshot, i) => {
            return {index: i, type: 'snapshot', 'snapshot-id': snapshot.id};
          }),
        )
        .concat([{index: 0, type: 'group', 'snapshot-ids': approvedGroup1.mapBy('id')}])
        .concat([{index: 0, type: 'group', 'snapshot-ids': approvedGroup2.mapBy('id')}]);

      this.setProperties({
        build,
        orderItems,
        snapshotsUnchanged,
        stub,
        browser,
        isKeyboardNavEnabled: true,
        isUnchangedSnapshotsVisible: false,
      });

      await render(hbs`<InfiniteSnapshotList
        @orderItems={{orderItems}}
        @build={{build}}
        @isKeyboardNavEnabled={{isKeyboardNavEnabled}}
        @activeBrowser={{browser}}
        @toggleUnchangedSnapshotsVisible={{stub}}
        @isUnchangedSnapshotsVisible={{isUnchangedSnapshotsVisible}}
        @snapshotsUnchanged={{snapshotsUnchanged}}
        @isBuildApprovable={{true}}
      />`);
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
      await percySnapshot(this.test, {darkMode: true});

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
    const oneTitle = 'one';
    const twoTitle = 'two';
    const threeTitle = 'three';
    let build;
    let snapshotOne;
    let snapshotTwo;
    let snapshotThree;
    let groupedSnapshots;
    let sortMetadata;

    beforeEach(async function() {
      const stub = sinon.stub();
      build = make('build', 'finished', {totalSnapshots: 11});

      snapshotOne = make('snapshot', 'withTwoBrowsers', {build, title: oneTitle});
      snapshotTwo = make('snapshot', 'withTwoBrowsers', 'approved', {build, title: twoTitle});
      snapshotThree = make('snapshot', 'withTwoBrowsers', 'rejected', {build, title: threeTitle});
      groupedSnapshots = makeList('snapshot', 3, 'withTwoBrowsers', {
        build,
        fingerprint: 'foo',
      });

      sortMetadata = metadataSort.create({
        metadataSort: [
          {
            browser_family_slug: 'firefox',
            default_browser_family_slug: true,
            items: [
              {
                index: 0,
                type: 'snapshot',
                'snapshot-id': snapshotTwo.id,
              },
              {
                index: 1,
                type: 'group',
                'snapshot-ids': groupedSnapshots.mapBy('id'),
              },
              {
                index: 2,
                type: 'snapshot',
                'snapshot-id': snapshotThree.id,
              },
              {
                index: 3,
                type: 'snapshot',
                'snapshot-id': snapshotOne.id,
              },
            ],
          },
          {
            browser_family_slug: 'chrome',
            default_browser_family_slug: false,
            items: [
              {
                index: 0,
                type: 'group',
                'snapshot-ids': groupedSnapshots.mapBy('id'),
              },
              {
                index: 1,
                type: 'snapshot',
                'snapshot-id': snapshotOne.id,
              },
              {
                index: 2,
                type: 'snapshot',
                'snapshot-id': snapshotTwo.id,
              },
              {
                index: 3,
                type: 'snapshot',
                'snapshot-id': snapshotThree.id,
              },
            ],
          },
        ],
      });

      this.setProperties({build, stub});
    });

    function expectIsGroup(block) {
      expect(block.isGroup).to.equal(true);
    }

    function expectIsSnapshot(block) {
      expect(block.isSnapshot).to.equal(true);
    }

    it('orders snapshots by metadata sort data for a browser', async function() {
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

    it('orders snapshots by metadata sort data for other browser', async function() {
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
