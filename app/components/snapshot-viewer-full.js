import {computed} from '@ember/object';
import {alias, filterBy, notEmpty, readOnly} from '@ember/object/computed';
import Component from '@ember/component';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';
import {EKMixin, keyUp} from 'ember-keyboard';
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
      snapshot: this.get('snapshot'),
      activeBrowser: this.get('activeBrowser'),
      snapshotSelectedWidth: this.get('snapshotSelectedWidth'),
    });
  }),
  selectedComparison: alias('filteredComparisons.selectedComparison'),

  galleryMap: GALLERY_MAP,

  galleryIndex: computed('comparisonMode', function() {
    return this.get('galleryMap').indexOf(this.get('comparisonMode'));
  }),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
  },

  actions: {
    updateSelectedWidth(newWidth) {
      this.set('snapshotSelectedWidth', newWidth);
      this.get('transitionRouteToWidth')(newWidth);
    },

    cycleComparisonMode(keyCode) {
      let galleryMap = this.get('galleryMap');
      let galleryLength = this.get('galleryMap.length');
      let directional = keyCode === KEYS.RIGHT_ARROW ? 1 : -1;
      let galleryIndex = this.get('galleryIndex');
      let newIndex =
        (((galleryIndex + directional) % galleryLength) + galleryLength) % galleryLength;
      this.get('updateComparisonMode')(galleryMap[newIndex]);
    },

    toggleCollaborationPanel() {
      this.toggleProperty('isCommentPanelShowing');
    },
  },

  onEscKeyPress: on(keyUp('Escape'), function() {
    this.get('closeSnapshotFullModal')();
  }),

  onLeftRightArrowPress: on(keyUp('ArrowRight'), keyUp('ArrowLeft'), function(event) {
    if (!this.get('selectedComparison') || this.get('selectedComparison.wasAdded')) {
      return;
    }
    this.send('cycleComparisonMode', event.keyCode);
  }),

  onUpArrowPress: on(keyUp('ArrowUp'), function() {
    this.get('updateSnapshotId')({isNext: false});
  }),

  onDownArrowPress: on(keyUp('ArrowDown'), function() {
    this.get('updateSnapshotId')({isNext: true});
  }),
});
