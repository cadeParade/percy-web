import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    const snapshotId = this.paramsFor(this.routeName).snapshot_id;
    const snapshot = this.store.findRecord('snapshot', snapshotId, {
      reload: true,
      include: 'comparisons.browser.browser-family',
    });
    return snapshot.then(snapshot => {
      const buildId = snapshot.belongsTo('build').id();
      const comparisons = snapshot.comparisons.toArray();
      const sortedComparisons = comparisonSort(comparisons);
      const comparisonToShow = sortedComparisons.firstObject;
      this.transitionTo(
        'organization.project.builds.build.snapshot',
        buildId,
        snapshot.id,
        comparisonToShow.width,
        {
          queryParams: {
            mode: comparisonToShow.diffRatio > 0 ? 'diff' : 'head',
            activeBrowserFamilySlug: comparisonToShow.browser.familySlug,
          },
        },
      );
    });
  },
});

function comparisonSort(comparisons) {
  return comparisons.sort(function(a, b) {
    if (a.diffRatio > b.diffRatio) {
      return -1;
    } else if (b.diffRatio > a.diffRatio) {
      return 1;
    }

    if (a.width > b.width) {
      return -1;
    } else if (b.width > a.width) {
      return 1;
    }

    return 0;
  });
}
