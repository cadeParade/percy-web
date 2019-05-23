import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import Component from '@ember/component';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';

const KEYS = {
  DOWN_ARROW: 40,
  UP_ARROW: 38,
  LEFT_ARROW: 37,
  RIGHT_ARROW: 39,
  ESC: 27,
};

const GALLERY_MAP = ['base', 'diff', 'head'];

export default Component.extend({
  classNames: ['SnapshotViewerFull'],
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

  isCommentPanelShowing: false,

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

  didRender() {
    this._super(...arguments);

    // Autofocus component for keyboard navigation
    this.$().attr({tabindex: 1});
    this.$().focus();
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

  keyDown(event) {
    if (event.keyCode === KEYS.ESC) {
      this.get('closeSnapshotFullModal')();
    }

    if (event.keyCode === KEYS.RIGHT_ARROW || event.keyCode === KEYS.LEFT_ARROW) {
      if (!this.get('selectedComparison') || this.get('selectedComparison.wasAdded')) {
        return;
      }
      this.send('cycleComparisonMode', event.keyCode);
    }

    if (event.keyCode === KEYS.UP_ARROW) {
      this.get('updateSnapshotId')({isNext: false});
    }
    if (event.keyCode === KEYS.DOWN_ARROW) {
      this.get('updateSnapshotId')({isNext: true});
    }
  },
});
