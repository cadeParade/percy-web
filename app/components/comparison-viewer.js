import {observer, computed} from '@ember/object'; // eslint-disable-line ember/no-observers
import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  // Arguments:
  comparison: null,
  allDiffsShown: null,

  store: service(),

  // State:
  classNames: ['ComparisonViewer'],
  attributeBindings: ['data-test-comparison-viewer'],
  'data-test-comparison-viewer': true,
  isUnchangedSnapshotExpanded: false,

  // If the global all diffs toggle is triggered, reset our own state to match the global state.
  // This is intentional an observer instead of a computed property. We want to the state of
  // showDiffOverlay loosely coupled to both a local action and the global diff toggle action.
  // eslint-disable-next-line ember/no-observers
  handleAllDiffsToggle: observer('allDiffsShown', function () {
    // eslint-disable-line
    this.set('showDiffOverlay', this.allDiffsShown);
  }),

  headSnapshot: computed('comparison.id', function () {
    return this.comparison.belongsTo('headSnapshot').value();
  }),

  actions: {
    expandUnchangedSnapshot() {
      this.toggleProperty('isUnchangedSnapshotExpanded');
    },
  },
});
