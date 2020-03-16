import Ember from 'ember';
import {not, alias, or, readOnly} from '@ember/object/computed';
// eslint-disable-next-line ember/no-observers
import {computed, get, set, setProperties, observer} from '@ember/object';
import Component from '@ember/component';
import {next} from '@ember/runloop';
import filteredComparisons, {hasDiffForBrowser} from 'percy-web/lib/filtered-comparisons';

const SNAPSHOT_HEADER_HEIGHT = 48; //px

// This component is inherited by items in snapshot list. These items can be
// (a) SnapshotViewer or
// (b) SnapshotGroup
// This component handles logic for:
// - choosing which comparison to display
// - switching widths
// - keyboard nav up and down the list
// - expand/collapse of list item
export default Component.extend({
  activeBrowser: null,
  activeSnapshotBlockIndex: null,
  allDiffsShown: null,
  build: null,
  userSelectedWidth: null,
  updateActiveSnapshotBlockIndex() {},
  // This will be populated if it is a snapshot-viewer component.
  snapshot: null,

  // TODO(sort) remove when old version is deprecated
  shouldDeferRendering: false,
  _shouldScroll: true,

  classNames: ['SnapshotViewer mb-2'],
  classNameBindings: [
    'isFocus:SnapshotViewer--focus',
    'isExpanded::SnapshotViewer--collapsed',
    'isActionable:SnapshotViewer--actionable',
  ],

  isFocus: alias('isActiveSnapshotBlock'),
  blockSelectedWidth: or('userSelectedWidth', 'filteredComparisons.defaultWidth'),
  selectedComparison: alias('filteredComparisons.selectedComparison'),

  isUserExpanded: false,
  isNotExpanded: not('isExpanded'),
  isActionable: alias('isNotExpanded'),

  isExpanded: or('isUserExpanded', '_isDefaultGroupExpanded'),
  isBlockApproved: readOnly('_isApproved'),

  shouldFullyRender: true,

  isActiveSnapshotBlock: computed('activeSnapshotBlockIndex', 'index', function() {
    return this.activeSnapshotBlockIndex === this.index;
  }),

  click() {
    set(this, '_shouldScroll', false);
    this.updateActiveSnapshotBlockIndex(this.index);
  },

  filteredComparisons: computed('coverSnapshot', 'activeBrowser', 'userSelectedWidth', function() {
    return filteredComparisons.create({
      snapshot: get(this, 'coverSnapshot'),
      activeBrowser: get(this, 'activeBrowser'),
      snapshotSelectedWidth: get(this, 'userSelectedWidth'),
    });
  }),

  _isDefaultGroupExpanded: computed(
    'isBlockApproved',
    'build.isApproved',
    'isActiveSnapshotBlock',
    function() {
      if (get(this, 'isActiveSnapshotBlock') || get(this, 'build.isApproved')) {
        return true;
      } else if (!hasDiffForBrowser(get(this, 'coverSnapshot'), get(this, 'activeBrowser'))) {
        return false;
      } else if (get(this, 'isBlockApproved')) {
        return false;
      } else {
        return true;
      }
    },
  ),

  // eslint-disable-next-line ember/no-observers
  _scrollToTop: observer('isActiveSnapshotBlock', function() {
    if (get(this, '_shouldScroll') && get(this, 'isActiveSnapshotBlock') && !Ember.testing) {
      if (get(this, 'snapshot.isUnchanged')) {
        setProperties(this, {
          isExpanded: true,
          isUnchangedSnapshotExpanded: true,
        });
      }
      // Wait a tick for the above properties to be set on unchanged snapshots, so the snapshot will
      // become fully expanded before scrolling. If we didn't wait for this, the component would
      // scroll to a height based on the closed snapshot viewer height rather than the opened one.
      next(() => {
        window.scrollTo(0, this.$().get(0).offsetTop - SNAPSHOT_HEADER_HEIGHT);
      });
    }
    set(this, '_shouldScroll', true);
  }),

  trackToggleOverlay(isDiffOverlayShowing) {
    const build = get(this, 'build');
    const organization = get(build, 'project.organization');
    const eventProperties = {
      project_id: get(build, 'project.id'),
      project_slug: get(build, 'project.slug'),
      build_id: get(build, 'id'),
      state: isDiffOverlayShowing ? 'on' : 'off',
      source: 'clicked_overlay',
    };
    this.analytics.track('Diff Toggled', organization, eventProperties);
  },

  actions: {
    updateSelectedWidth(value) {
      set(this, 'userSelectedWidth', value);
      this.analytics.track('Snapshot Width Selected');
    },
    expandBlock() {
      if (!get(this, '_defaultIsExpanded')) {
        set(this, 'isUserExpanded', true);
      }
    },
  },
});
