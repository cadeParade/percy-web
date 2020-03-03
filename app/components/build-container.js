import {or, readOnly} from '@ember/object/computed';
import {assert} from '@ember/debug';
import Component from '@ember/component';
import PollingMixin from 'percy-web/mixins/polling';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {snapshotsWithNoDiffForBrowser} from 'percy-web/lib/filtered-comparisons';
import {task} from 'ember-concurrency';
import {next} from '@ember/runloop';

export default Component.extend(PollingMixin, {
  classNames: ['BuildContainer'],

  store: service(),
  build: null,
  snapshotQuery: service(),
  snapshotsUnchanged: null,
  allDiffsShown: true,
  updateActiveBrowser: null,
  isUnchangedSnapshotsVisible: false,
  isBuildApprovable: true,
  allApprovableSnapshots: null,

  chosenBrowser: null,
  page: 0,

  buildBrowsers: readOnly('build.browsers'),
  defaultBrowser: computed('buildBrowsers.@each.familySlug', 'metadataSort.browsers', function () {
    let defaultBrowserSlug;
    const browserData = this.metadataSort.browsers;
    for (const browserSlug in browserData) {
      if (browserData[browserSlug].default === 'true') {
        defaultBrowserSlug = browserSlug;
      }
    }

    return this.buildBrowsers.findBy('familySlug', defaultBrowserInfo.browser);
  }),

  orderItems: computed('metadataSort', 'activeBrowser.familySlug', function () {
    return this.metadataSort.browsers[this.activeBrowser.familySlug].items;
  }),

  activeBrowser: or('chosenBrowser', 'defaultBrowser'),

  shouldPollForUpdates: or('build.isPending', 'build.isProcessing'),

  // TODO update what endpoint is hit by polling
  pollRefresh() {
    this.build.reload().then(build => {
      if (build.get('isFinished')) {
        this.set('isSnapshotsLoading', true);
        const changedSnapshots = this.snapshotQuery.getChangedSnapshots(build);
        changedSnapshots.then(() => {
          this.initializeSnapshotOrdering();
        });
      }
    });
  },

  // TODO is this relevant anymore?
  _getLoadedSnapshots() {
    // Get snapshots without making new request
    return this.store.peekAll('snapshot').filterBy('build.id', this.get('build.id'));
  },

  isUnchangedSnapshotsLoading: readOnly('_toggleUnchangedSnapshotsVisible.isRunning'),

  _toggleUnchangedSnapshotsVisible: task(function* () {
    let loadedSnapshots = this._getLoadedSnapshots();
    yield this.snapshotQuery.getUnchangedSnapshots(this.build);
    loadedSnapshots = this._getLoadedSnapshots();

    const alreadyLoadedSnapshotsWithNoDiff = yield snapshotsWithNoDiffForBrowser(
      loadedSnapshots,
      this.activeBrowser,
    ).sortBy('isUnchanged');

    this.set('snapshotsUnchanged', alreadyLoadedSnapshotsWithNoDiff);
    this.toggleProperty('isUnchangedSnapshotsVisible');
    // Update property available from fullscreen snapshot route that there are some unchanged
    // snapshots in the store.
    this.notifyOfUnchangedSnapshots(alreadyLoadedSnapshotsWithNoDiff);
  }),

  // TODO
  _resetUnchangedSnapshots() {
    this.set('snapshotsUnchanged', []);
    this.set('isUnchangedSnapshotsVisible', false);
  },

  init() {
    this._super(...arguments);
    this.allApprovableSnapshots = this.allApprovableSnapshots || [];
    this.snapshotsUnchanged = this.snapshotsUnchanged || [];
  },

  actions: {
    updateActiveBrowser(newBrowser) {
      // TODO do this somehow else
      this.set('isSnapshotsLoading', true);

      this.set('chosenBrowser', newBrowser);
      this.set('page', 0);
      next(() => {
        this.set('isSnapshotsLoading', false);
      });
      this._resetUnchangedSnapshots();
      // TODO
      // const organization = this.get('build.project.organization');
      // const eventProperties = {
      //   browser_id: newBrowser.get('id'),
      //   browser_family_slug: newBrowser.get('browserFamily.slug'),
      //   build_id: this.get('build.id'),
      // };
      // this.analytics.track('Browser Switched', organization, eventProperties);
    },

    //TODO
    toggleUnchangedSnapshotsVisible() {
      this._toggleUnchangedSnapshotsVisible.perform();
    },

    toggleAllDiffs(options = {}) {
      this.toggleProperty('allDiffsShown');

      // Track the toggle event and source.
      const trackSource = options.trackSource;
      assert('invalid trackSource', ['clicked_toggle', 'keypress'].includes(trackSource));

      const build = this.build;
      const organization = build.get('project.organization');
      const eventProperties = {
        project_id: build.get('project.id'),
        project_slug: build.get('project.slug'),
        build_id: build.get('id'),
        state: this.allDiffsShown ? 'on' : 'off',
        source: trackSource,
      };
      this.analytics.track('All Diffs Toggled', organization, eventProperties);
    },
  },
});
