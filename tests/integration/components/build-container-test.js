import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import DS from 'ember-data';
import {defer} from 'rsvp';
import BuildPage from 'percy-web/tests/pages/build-page';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import mockSnapshotQueryService from 'percy-web/tests/helpers/mock-snapshot-query-service';
import {render} from '@ember/test-helpers';
import {createDefaultSortMetadata} from 'percy-web/mirage/helpers/create-sort-metadata';

describe('Integration: BuildContainer', function () {
  setupRenderingTest('build-container', {
    integration: true,
  });

  beforeEach(function () {
    setupFactoryGuy(this);
  });

  describe('snapshot display during different build states', function () {
    beforeEach(async function () {
      const build = make('build', 'withBaseBuild', {buildNumber: 1});
      make('snapshot', 'withComparisons', {build});
      const browser = make('browser');
      const stub = sinon.stub();

      createDefaultSortMetadata(this, build);

      this.setProperties({build, stub, browser});

      // Override the pollRefresh method for the test. This does not happen IRL,
      // but we can't have the component make requests in this integration test
      await render(hbs`<BuildContainer
        @build={{build}}
        @pollRefresh={{stub}}
      />`);
    });

    it('does not display snapshots while build is processing', async function () {
      this.set('build.state', 'processing');
      this.set('build.totalComparisons', 2312);
      this.set('build.totalComparisonsFinished', 2187);

      await percySnapshot(this.test, {darkMode: true});
      expect(BuildPage.snapshotList.isVisible).to.equal(false);
    });

    it('does not display snapshots while build is pending', async function () {
      this.set('build.state', 'pending');

      await percySnapshot(this.test, {darkMode: true});
      expect(BuildPage.snapshotList.isVisible).to.equal(false);
    });

    it('does not display snapshots when build is failed', async function () {
      const failedBuild = make('build', 'withBaseBuild', 'failed');
      this.set('build', failedBuild);

      await percySnapshot(this.test, {darkMode: true});
      expect(BuildPage.snapshotList.isVisible).to.equal(false);
    });

    it('does not display snapshots when build is expired', async function () {
      this.set('build.state', 'expired');

      await percySnapshot(this.test, {darkMode: true});
      expect(BuildPage.snapshotList.isVisible).to.equal(false);
    });
  });

  it('does not display snapshots when isSnapshotsLoading is true', async function () {
    const build = make('build', 'withBaseBuild', 'finished');
    DS.PromiseArray.create({promise: defer().promise});

    createDefaultSortMetadata(this, build);

    this.setProperties({build});

    await render(hbs`<BuildContainer
      @build={{build}}
      @isSnapshotsLoading={{true}}
    />`);

    await percySnapshot(this.test, {darkMode: true});
    expect(BuildPage.snapshotList.isVisible).to.equal(false);
  });

  it('displays snapshots when build is finished', async function () {
    const build = make('build', 'withBaseBuild', 'finished');
    const stub = sinon.stub();
    make('snapshot', 'withComparisons', {build});

    createDefaultSortMetadata(this, build);

    this.setProperties({
      build,
      stub,
    });

    await render(hbs`<BuildContainer
      @build={{build}}
      @fetchUnchangedSnapshots={{stub}}
    />`);
    await percySnapshot(this.test, {darkMode: true});

    expect(BuildPage.snapshotList.isVisible).to.equal(true);
    expect(BuildPage.snapshotList.snapshots.length).to.equal(1);
    expect(BuildPage.snapshotList.isNoDiffsBatchVisible).to.equal(true);
  });

  it('shows loading indicator while fetching unchanged diffs', async function () {
    const stub = sinon.stub();
    const build = make('build', 'withBaseBuild', 'finished');
    createDefaultSortMetadata(this, build);
    mockSnapshotQueryService(this, defer().promise);

    this.setProperties({
      build,
      stub,
    });

    await render(hbs`<BuildContainer
      @build={{build}}
      @fetchUnchangedSnapshots={{stub}}
    />`);

    await BuildPage.snapshotList.clickToggleNoDiffsSection();
    await percySnapshot(this.test, {darkMode: true});
  });

  describe('when isBuildApprovable is false', function () {
    beforeEach(async function () {
      const build = make('build', 'withBaseBuild', 'finished');
      const stub = sinon.stub();
      const isBuildApprovable = false;
      make('snapshot', 'withComparisons', {build});
      createDefaultSortMetadata(this, build);
      this.setProperties({
        build,
        stub,
        isBuildApprovable,
      });

      await render(hbs`<BuildContainer
        @build={{build}}
        @isBuildApprovable={{isBuildApprovable}}
        @fetchUnchangedSnapshots={{stub}}
      />`);
    });

    it('displays notice that build is public', async function () {
      expect(BuildPage.isPublicBuildNoticeVisible).to.equal(true);
      await percySnapshot(this.test, {darkMode: true});
    });
  });

  describe('toggle all diffs', function () {
    beforeEach(async function () {
      const build = make('build', 'withBaseBuild', 'finished');
      const diffSnapshot = make('snapshot', 'withComparisons', {build});
      const group = makeList('snapshot', 3, 'withComparisons', {build, fingerprint: 'aaa'});
      const stub = sinon.stub();
      createDefaultSortMetadata(this, build, [group, diffSnapshot]);
      this.setProperties({
        build,
        stub,
      });

      await render(hbs`<BuildContainer
        @build={{build}}
        @fetchUnchangedSnapshots={{stub}}
      />`);
    });

    it('toggles diffs of snapshots and snapshot groups', async function () {
      BuildPage.snapshotBlocks.forEach(block => expect(block.isDiffImageVisible).to.equal(true));
      await BuildPage.clickToggleDiffsButton();
      BuildPage.snapshotBlocks.forEach(block => expect(block.isDiffImageVisible).to.equal(false));
      await BuildPage.clickToggleDiffsButton();
      BuildPage.snapshotBlocks.forEach(block => expect(block.isDiffImageVisible).to.equal(true));
    });

    it('toggles snapshots within group when group is expanded', async function () {
      const group = BuildPage.snapshotBlocks[0].snapshotGroup;
      await group.toggleShowAllSnapshots();
      group.snapshots.forEach(snapshot => expect(snapshot.isDiffImageVisible).to.equal(true));
      await BuildPage.clickToggleDiffsButton();
      group.snapshots.forEach(snapshot => expect(snapshot.isDiffImageVisible).to.equal(false));
      expect(BuildPage.snapshotBlocks[1].isDiffImageVisible).to.equal(false);
    });
  });
});
