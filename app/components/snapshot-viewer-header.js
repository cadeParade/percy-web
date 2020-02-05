import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {equal, not, or, readOnly} from '@ember/object/computed';
import utils from 'percy-web/lib/utils';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';

export default Component.extend({
  // required params
  flashMessages: service(),
  launchDarkly: service(),
  router: service(),
  selectedWidth: null,
  selectedComparison: null,
  snapshot: null,
  snapshotSelectedWidth: null,
  activeBrowser: null,
  openCommentThreads: null, // set by init

  // optional params
  fullscreen: false,
  comparisonMode: '',
  tagName: '',

  // required actions
  updateSelectedWidth: null,

  // optional actions
  expandSnapshot() {},
  registerChild() {},
  updateComparisonMode() {},

  unresolvedCommentThreadCount: readOnly('openCommentThreads.length'),

  filteredComparisons: computed('snapshot', 'activeBrowser', 'snapshotSelectedWidth', function() {
    return filteredComparisons.create({
      snapshot: this.snapshot,
      activeBrowser: this.activeBrowser,
      snapshotSelectedWidth: this.snapshotSelectedWidth,
    });
  }),

  isShowingFilteredComparisons: true,
  isNotShowingFilteredComparisons: not('isShowingFilteredComparisons'),

  isShowingAllComparisons: or('noComparisonsHaveDiffs', 'isNotShowingFilteredComparisons'),
  noComparisonsHaveDiffs: equal('filteredComparisons.comparisonsWithDiffs.length', 0),
  allComparisonsHaveDiffs: computed(
    'filteredComparisons.{comparisons.[],comparisonsWithDiffs.[]}',
    function() {
      return (
        this.get('filteredComparisons.comparisons.length') ===
        this.get('filteredComparisons.comparisonsWithDiffs.length')
      );
    },
  ),

  hasDiffsInBrowser: readOnly('filteredComparisons.anyComparisonsHaveDiffs'),

  actions: {
    handleTransitionToBuildPage(buildId, event) {
      this.transitionToBuildPage(event.currentTarget.pathname, buildId);
    },

    onCopySnapshotUrlToClipboard() {
      this.flashMessages.success('Snapshot URL was copied to your clipboard');
    },

    toggleFilteredComparisons() {
      this.toggleProperty('isShowingFilteredComparisons');
    },

    downloadHTML(type, snapshot) {
      const options = {includePercyMode: true};
      const url = utils.buildApiUrl(`${type}Asset`, snapshot.get('id'), options);

      utils.replaceWindowLocation(url);
    },

    downloadDiff(selectedComparison) {
      const options = {includePercyMode: true};
      const url = utils.buildApiUrl('snapshotSourceDiff', selectedComparison.get('id'), options);

      utils.replaceWindowLocation(url);
    },
    async goToLastChangedSnapshot() {
      const latestChangedAncestorRef = this.snapshot.belongsTo('latestChangedAncestor');
      try {
        const latestChangedAncestor = await latestChangedAncestorRef.reload();
        this.router.transitionTo(
          'organization.project.builds.default-comparison',
          latestChangedAncestor.id,
        );
      } catch (e) {
        try {
          let message = 'There was a problem fetching the latest changed snapshot.';
          if (e.errors[0].status === 'not_found') {
            message = 'This is the earliest change we have on record for this snapshot.';
          }
          if (e.errors[0].status === 'conflict') {
            message = e.errors[0].detail;
          }
          this.flashMessages.info(message);
        } catch (e) {
          // If the error is other than 404 or the error did not come back in the right format.
          this.flashMessages.info('There was a problem fetching the latest changed snapshot.');
        }
      }
    },
  },

  init() {
    this._super(...arguments);
    this.openCommentThreads = this.openCommentThreads || [];
  },
});
