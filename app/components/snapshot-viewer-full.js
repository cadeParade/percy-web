import {computed} from '@ember/object';
import {alias, filterBy, notEmpty, readOnly} from '@ember/object/computed';
import Component from '@ember/component';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';

const KEYS = {
  RIGHT_ARROW: 39,
};

const GALLERY_MAP = ['base', 'diff', 'head'];

export default Component.extend(EKMixin, {
  classNames: ['SnapshotViewerFull', 'overflow-y-scroll'],
  attributeBindings: ['data-test-snapshot-viewer-full'],
  'data-test-snapshot-viewer-full': true,

  // Required params
  comparisonMode: null,
  updateComparisonMode: null,
  transitionRouteToWidth: null,
  closeSnapshotFullModal: null,
  createReview: null,
  snapshot: null,
  snapshotSelectedWidth: null,
  activeBrowser: null,

  commentThreads: readOnly('snapshot.commentThreads'),
  openCommentThreads: filterBy('commentThreads', 'isOpen'),
  isCommentPanelShowing: notEmpty('openCommentThreads'),

  filteredComparisons: computed('snapshot', 'activeBrowser', 'snapshotSelectedWidth', function() {
    return filteredComparisons.create({
      snapshot: this.snapshot,
      activeBrowser: this.activeBrowser,
      snapshotSelectedWidth: this.snapshotSelectedWidth,
    });
  }),
  selectedComparison: alias('filteredComparisons.selectedComparison'),

  galleryMap: GALLERY_MAP,

  galleryIndex: computed('comparisonMode', function() {
    return this.galleryMap.indexOf(this.comparisonMode);
  }),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
  },

  actions: {
    updateSelectedWidth(newWidth) {
      this.set('snapshotSelectedWidth', newWidth);
      this.transitionRouteToWidth(newWidth);
    },

    cycleComparisonMode(keyCode) {
      let galleryMap = this.galleryMap;
      let galleryLength = this.get('galleryMap.length');
      let directional = keyCode === KEYS.RIGHT_ARROW ? 1 : -1;
      let galleryIndex = this.galleryIndex;
      let newIndex =
        (((galleryIndex + directional) % galleryLength) + galleryLength) % galleryLength;
      this.updateComparisonMode(galleryMap[newIndex]);
    },

    toggleCollaborationPanel() {
      this.toggleProperty('isCommentPanelShowing');
    },
  },

  onEscKeyPress: on(keyDown('Escape'), function() {
    this.closeSnapshotFullModal();
  }),

  onLeftRightArrowPress: on(keyDown('ArrowRight'), keyDown('ArrowLeft'), function(event) {
    if (!this.selectedComparison || this.get('selectedComparison.wasAdded')) {
      return;
    }
    this.send('cycleComparisonMode', event.keyCode);
  }),

  onUpArrowPress: on(keyDown('ArrowUp'), function() {
    this.updateSnapshotId({isNext: false});
  }),

  onDownArrowPress: on(keyDown('ArrowDown'), function() {
    this.updateSnapshotId({isNext: true});
  }),
});
