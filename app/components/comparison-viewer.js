import {observer} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  // Arguments:
  comparison: null,
  allDiffsShown: null,

  // State:
  classNames: ['ComparisonViewer bg-gray-000 border-b'],
  attributeBindings: ['data-test-comparison-viewer'],
  'data-test-comparison-viewer': true,
  isUnchangedSnapshotExpanded: false,

  // If the global all diffs toggle is triggered, reset our own state to match the global state.
  // This is intentional an observer instead of a computed property. We want to the state of
  // showDiffOverlay loosely coupled to both a local action and the global diff toggle action.
  handleAllDiffsToggle: observer('allDiffsShown', function() {
    this.set('showDiffOverlay', this.get('allDiffsShown'));
  }),

  actions: {
    expandUnchangedSnapshot() {
      this.toggleProperty('isUnchangedSnapshotExpanded');
    },
  },
});
