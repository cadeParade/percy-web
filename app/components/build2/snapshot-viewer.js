import {filterBy, notEmpty, or, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed, get} from '@ember/object';
import Component from '@ember/component';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';

export default Component.extend({
  launchDarkly: service(),
  snapshot: null,
  createReview: null,
  externalIsCommentPanelShowing: false,
  userIsCommentPanelShowing: undefined,

  attributeBindings: ['data-test-snapshot-viewer'],
  'data-test-snapshot-viewer': true,

  id: readOnly('snapshot.id'),
  _isApproved: readOnly('snapshot.isApproved'),
  isUnchangedSnapshotExpanded: or('isFocus', 'isExpanded'),

  _internalIsCommentPanelShowing: notEmpty('openCommentThreads'),

  isCommentPanelShowing: computed(
    'userIsCommentPanelShowing',
    '_internalIsCommentPanelShowing',
    'externalIsCommentPanelShowing',
    function() {
      if (this.userIsCommentPanelShowing !== undefined) {
        return this.userIsCommentPanelShowing;
      } else {
        return this.defaultIsCommentPanelShowing;
      }
    },
  ),

  defaultIsCommentPanelShowing: or(
    '_internalIsCommentPanelShowing',
    'externalIsCommentPanelShowing',
  ),
  commentThreads: readOnly('snapshot.commentThreads'),
  openCommentThreads: filterBy('commentThreads', 'isOpen'),

  isSnapshotShowingDiffOverlay: true,

  _browsers: readOnly('snapshot.build.browsers'),

  defaultBrowser: computed('_browsers', function() {
    const chromeBrowser = this._browsers.findBy('familySlug', 'chrome');
    const firefoxBrowser = this._browsers.findBy('familySlug', 'firefox');

    const chromeComparisons = this.snapshot.comparisons.filterBy('browser.familySlug', 'chrome');
    const firefoxComparisons = this.snapshot.comparisons.filterBy('browser.familySlug', 'firefox');
    if (chromeComparisons.length > 0) {
      return chromeBrowser;
    } else if (firefoxComparisons.length > 0) {
      return firefoxBrowser;
    } else {
      return this.get('_browsers.firstObject');
    }
  }),

  chosenBrowser: null,
  activeBrowser: or('chosenBrowser', 'defaultBrowser'),

  selectedComparison: readOnly('filteredComparisons.selectedComparison'),
  filteredComparisons: computed('snapshot', 'activeBrowser', 'userSelectedWidth', function() {
    return filteredComparisons.create({
      snapshot: get(this, 'snapshot'),
      activeBrowser: get(this, 'activeBrowser'),
      snapshotSelectedWidth: get(this, 'userSelectedWidth'),
    });
  }),

  snapshotSelectedWidth: or('userSelectedWidth', 'filteredComparisons.defaultWidth'),
  userSelectedWidth: null,

  actions: {
    updateActiveBrowser(browser) {
      this.set('chosenBrowser', browser);
    },

    updateSelectedWidth(value) {
      this.set('userSelectedWidth', value);
    },

    toggleSnapshotOverlay() {
      this.toggleProperty('isSnapshotShowingDiffOverlay');
    },

    toggleCollaborationPanel() {
      if (this.userIsCommentPanelShowing === undefined) {
        this.set('userIsCommentPanelShowing', !this.defaultIsCommentPanelShowing);
      } else {
        this.toggleProperty('userIsCommentPanelShowing');
      }
    },
  },
});
