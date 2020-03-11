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
  launchDarkly: service(),
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

  snapshotsChanged: computed('allChangedBrowserSnapshotsSorted', 'activeBrowser.id', function () {
    if (!this.allChangedBrowserSnapshotsSorted) return;

    return this.allChangedBrowserSnapshotsSorted[this.get('activeBrowser.id')];
  }),

  browserWithMostDiffs: computed('_browsers', 'allChangedBrowserSnapshotsSorted.[]', function () {
    const snapshots = this.allChangedBrowserSnapshotsSorted;
    if (!snapshots) {
      return;
    }
    const browserWithMostDiffsId = _browserWithMostUnreviewedDiffsId(snapshots);
    return this._browsers.findBy('id', browserWithMostDiffsId);
  }),

  _browsers: readOnly('build.browsers'),

  defaultBrowser: computed('_browsers', 'browserWithMostDiffs', function() {
    if (this.launchDarkly.variation('snapshot-sort-api')) {
      const defaultBrowserSlug = this.build.sortMetadata.defaultBrowserSlug;
      return this._browsers.findBy('familySlug', defaultBrowserSlug);
    } else {
      const chromeBrowser = this._browsers.findBy('familySlug', 'chrome');
      const browserWithMostDiffs = this.browserWithMostDiffs;
      if (browserWithMostDiffs) {
        return browserWithMostDiffs;
      } else if (chromeBrowser) {
        return chromeBrowser;
      } else {
        return this.get('_browsers.firstObject');
      }
    }
  }),

  orderItems: computed('build.sortMetadata', 'activeBrowser.familySlug', function () {
    return this.build.sortMetadata.orderItemsForBrowser(this.activeBrowser.familySlug);
  }),

  activeBrowser: or('chosenBrowser', 'defaultBrowser'),

  shouldPollForUpdates: or('build.isPending', 'build.isProcessing'),

  pollRefresh() {
    this.build.reload().then(build => {
      if (build.get('isFinished')) {
        this.set('isSnapshotsLoading', true);

        if (this.launchDarkly.variation('snapshot-sort-api')) {
          this.fetchSnapshots(build);
        } else {
          const changedSnapshots = this.snapshotQuery.getChangedSnapshots(build);
          changedSnapshots.then(() => {
            this.initializeSnapshotOrdering();
          });
        }
      }
    });
  },

  // TODO(sort) is this relevant anymore?
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

  // TODO(sort)
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
      if (this.launchDarkly.variation('snapshot-sort-api')) {
        // TODO(sort) do this somehow else
        this.set('isSnapshotsLoading', true);

        this.set('chosenBrowser', newBrowser);
        this.set('page', 0);
        next(() => {
          this.set('isSnapshotsLoading', false);
        });
      } else {
        this.set('chosenBrowser', newBrowser);
      }

      this._resetUnchangedSnapshots();
      const organization = this.get('build.project.organization');
      const eventProperties = {
        browser_id: newBrowser.get('id'),
        browser_family_slug: newBrowser.get('browserFamily.slug'),
        build_id: this.get('build.id'),
      };
      this.analytics.track('Browser Switched', organization, eventProperties);
    },

    //TODO(sort)
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

function _browserWithMostUnreviewedDiffsId(allChangedBrowserSnapshotsSorted) {
  // need to convert the object of arrays to an array of objects
  // [{browserId: foo, len: int1}, {browserId: bar, len: int2}]
  const browserCounts = Object.keys(allChangedBrowserSnapshotsSorted).map(browserId => {
    const unreviewedSnapshotsForBrowser = allChangedBrowserSnapshotsSorted[browserId].filterBy(
      'isUnreviewed',
    );
    return {
      browserId: browserId,
      len: unreviewedSnapshotsForBrowser.length,
    };
  });

  let maxCount = 0;
  let maxCountId = null;

  // Use vanilla `for` loop so we can return early if we want.
  for (let i = 0; i < browserCounts.length; i++) {
    const browserCount = browserCounts[i];
    if (browserCount.len > maxCount) {
      maxCount = browserCount.len;
      maxCountId = browserCount.browserId;
    } else if (browserCount.len === maxCount) {
      return;
    }
  }

  return maxCountId;
}
