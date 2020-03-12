import {computed} from '@ember/object';
import {alias, filterBy, notEmpty, readOnly} from '@ember/object/computed';
import Component from '@ember/component';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';
import {inject as service} from '@ember/service';

const KEYS = {
  RIGHT_ARROW: 39,
};

const GALLERY_MAP = ['diff', 'base', 'head'];

export default Component.extend(EKMixin, {
  router: service(),

  classNames: ['SnapshotViewerFull', 'overflow-y-scroll'],
  attributeBindings: ['data-test-snapshot-viewer-full'],
  'data-test-snapshot-viewer-full': true,

  // Required params
  comparisonMode: null,
  updateComparisonMode: null,
  transitionRouteToWidth: null,
  snapshot: null,
  snapshotSelectedWidth: null,
  activeBrowser: null,
  userIsCommentPanelShowing: undefined,

  commentThreads: readOnly('snapshot.commentThreads'),
  openCommentThreads: filterBy('commentThreads', 'isOpen'),
  defaultIsCommentPanelShowing: notEmpty('openCommentThreads'),
  isCommentPanelShowing: computed('userIsCommentPanelShowing', 'openCommentThreads.[]', function() {
    if (this.userIsCommentPanelShowing !== undefined) {
      return this.userIsCommentPanelShowing;
    } else {
      return this.defaultIsCommentPanelShowing;
    }
  }),

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
      if (this.userIsCommentPanelShowing === undefined) {
        this.set('userIsCommentPanelShowing', !this.defaultIsCommentPanelShowing);
      } else {
        this.toggleProperty('userIsCommentPanelShowing');
      }
    },
  },

  onEscKeyPress: on(keyDown('Escape'), function() {
    this.router.transitionTo(
      'organization.project.builds.build.index',
      this.snapshot.build.get('id'),
    );
  }),

  onLeftRightArrowPress: on(keyDown('ArrowRight'), keyDown('ArrowLeft'), function(event) {
    if (!this.selectedComparison || this.get('selectedComparison.wasAdded')) {
      return;
    }
    this.send('cycleComparisonMode', event.keyCode);
  }),
});
