import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {equal, not, or, readOnly} from '@ember/object/computed';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';

export default Component.extend({
  // required params
  flashMessages: service(),
  launchDarkly: service(),
  router: service(),
  reviews: service(),
  selectedWidth: null,
  selectedComparison: null,
  snapshot: null,
  snapshotSelectedWidth: null,
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

  isShowingFilteredComparisons: false,
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
    approveSnapshot() {
      return this.reviews.createApprovalReview(this.snapshot.build, [this.snapshot]);
    },

    handleTransitionToBuildPage(buildId, event) {
      this.transitionToBuildPage(event.currentTarget.pathname, buildId);
    },

    onCopySnapshotUrlToClipboard() {
      this.flashMessages.success('Snapshot URL was copied to your clipboard');
    },

    toggleFilteredComparisons() {
      this.toggleProperty('isShowingFilteredComparisons');
    },
  },
  init() {
    this._super(...arguments);
    this.openCommentThreads = this.openCommentThreads || [];
  },
});
