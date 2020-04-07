import {or, readOnly} from '@ember/object/computed';
import {assert} from '@ember/debug';
import Component from '@ember/component';
import PollingMixin from 'percy-web/mixins/polling';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend(PollingMixin, {
  classNames: ['BuildContainer'],

  store: service(),
  build: null,
  snapshotQuery: service(),
  allDiffsShown: true,
  updateActiveBrowser: null,
  isUnchangedSnapshotsVisible: false,
  isBuildApprovable: true,

  chosenBrowser: null,
  page: 1,
  unchangedPage: 1,

  buildSortMetadata: readOnly('build.sortMetadata'),

  _browsers: readOnly('build.browsers'),

  defaultBrowser: computed('_browsers', 'build.isFinished', 'browserWithMostDiffs', function () {
    if (this.build.isFinished && this.buildSortMetadata) {
      const defaultBrowserSlug = this.buildSortMetadata.defaultBrowserSlug;
      return this._browsers.findBy('familySlug', defaultBrowserSlug);
    } else {
      return this.get('_browsers.firstObject');
    }
  }),

  blockItems: computed(
    'buildSortMetadata.blockItemsForBrowsers.[]',
    'activeBrowser.familySlug',
    function () {
      return this.buildSortMetadata.blockItemsForBrowsers[this.activeBrowser.familySlug];
    },
  ),

  activeBrowser: or('chosenBrowser', 'defaultBrowser'),

  shouldPollForUpdates: or('build.isPending', 'build.isProcessing'),

  pollRefresh() {
    this.build.reload().then(build => {
      if (build.get('isFinished')) {
        this.set('isSnapshotsLoading', true);
        this.fetchChangedSnapshots(build);
      }
    });
  },

  unchangedBlockItems: computed(
    'buildSortMetadata.unchangedBlockItemsForBrowsers.[]',
    'activeBrowser.familySlug',
    function () {
      return this.buildSortMetadata.unchangedBlockItemsForBrowsers[this.activeBrowser.familySlug];
    },
  ),

  _resetUnchangedSnapshots() {
    this.set('isUnchangedSnapshotsVisible', false);
  },

  actions: {
    updateActiveBrowser(newBrowser) {
      this.set('page', 0);
      this.set('chosenBrowser', newBrowser);

      this._resetUnchangedSnapshots();

      const organization = this.get('build.project.organization');
      const eventProperties = {
        browser_id: newBrowser.get('id'),
        browser_family_slug: newBrowser.get('browserFamily.slug'),
        build_id: this.get('build.id'),
      };
      this.analytics.track('Browser Switched', organization, eventProperties);
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
