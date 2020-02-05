import {notEmpty, filterBy, or, alias} from '@ember/object/computed';
import Object, {get, set, computed} from '@ember/object';

export default class FilteredComparisons extends Object {
  activeBrowser = null;
  snapshot = null;
  snapshotSelectedWidth = null;

  @alias('snapshot.comparisons')
  _comparisons;

  @computed('_comparisons.@each.browser', 'activeBrowser')
  get comparisons() {
    return comparisonsForBrowser(get(this, '_comparisons'), get(this, 'activeBrowser'));
  }

  @computed('comparisons.@each.width', 'snapshotSelectedWidth')
  get comparisonForWidth() {
    const width = get(this, 'snapshotSelectedWidth') || get(this, 'defaultWidth');
    return comparisonForWidth(get(this, 'comparisons'), width);
  }

  @computed('comparisons.@each.width')
  get widestComparisonForBrowser() {
    return widestComparison(get(this, 'comparisons'));
  }

  @computed('comparisons.@each.width')
  get widestComparisonWithDiff() {
    return widestComparisonWithDiff(get(this, 'comparisons'));
  }

  @or('comparisonForWidth', 'widestComparisonForBrowser')
  selectedComparison;

  @or('widestComparisonWithDiff.width', 'widestComparisonForBrowser.width')
  defaultWidth;

  @filterBy('comparisons', 'isDifferent')
  comparisonsWithDiffs;

  @notEmpty('comparisonsWithDiffs')
  anyComparisonsHaveDiffs;
}

export function widestComparison(comparisons) {
  if (!comparisons) {
    comparisons = [];
  }
  return get(comparisons.sortBy('width'), 'lastObject');
}

export function comparisonForWidth(comparisons, width) {
  if (!comparisons || !width) {
    return;
  }
  return comparisons.findBy('width', parseInt(width, 10));
}

export function comparisonsForBrowser(comparisons, browser) {
  if (!comparisons || !browser) {
    return [];
  }
  return comparisons.filterBy('browser.id', get(browser, 'id'));
}

export function widestComparisonWithDiff(comparisons) {
  if (!comparisons) {
    return;
  }
  return get(comparisons.sortBy('width').filterBy('isDifferent'), 'lastObject');
}

export function snapshotsWithDiffForBrowser(snapshots, browser) {
  if (!snapshots || !browser) {
    return [];
  }
  return snapshots.filter(snapshot => {
    return hasDiffForBrowser(snapshot, browser);
  });
}

export function snapshotsWithNoDiffForBrowser(snapshots, browser) {
  return snapshots.filter(snapshot => {
    const allComparisons = get(snapshot, 'comparisons');
    const filteredComparisons = comparisonsForBrowser(allComparisons, browser);
    return filteredComparisons.every(comparison => {
      return get(comparison, 'isSame');
    });
  });
}

export function hasDiffForBrowser(snapshot, browser) {
  return comparisonsForBrowser(get(snapshot, 'comparisons'), browser).any(comparison => {
    return get(comparison, 'isDifferent');
  });
}

// Returns Ember Object with a property for each browser for the build,
// where the value is an array of snapshots that have diffs for that browser.
// It is an ember object rather than a POJO so computed properties can observe it, and for ease
// of use in templates.
// Ex: {
//   firefox: [<snapshot>, <snapshot>],
//   chrome: [<snapshot>, <snapshot>, <snapshot>]
// }
export function countDiffsWithSnapshotsPerBrowser(snapshots, browsers) {
  const counts = Object.create();

  browsers.forEach(browser => {
    const unreviewedSnapshotsWithDiffsInBrowser = snapshotsWithDiffForBrowser(snapshots, browser);
    set(counts, get(browser, 'id'), unreviewedSnapshotsWithDiffsInBrowser);
  });
  return counts;
}
