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
  toggleViewMode: null,
  updateSelectedWidth: null,

  // optional actions
  expandSnapshot() {},
  registerChild() {},
  updateComparisonMode() {},

  unresolvedCommentThreadCount: readOnly('openCommentThreads.length'),

  filteredComparisons: computed('snapshot', 'activeBrowser', 'snapshotSelectedWidth', function() {
    return filteredComparisons.create({
      snapshot: this.get('snapshot'),
      activeBrowser: this.get('activeBrowser'),
      snapshotSelectedWidth: this.get('snapshotSelectedWidth'),
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
    onCopySnapshotUrlToClipboard() {
      this.get('flashMessages').success('Snapshot URL was copied to your clipboard');
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
  },

  init() {
    this._super(...arguments);
    this.openCommentThreads = this.openCommentThreads || [];
  },
});
