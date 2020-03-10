import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Controller from '@ember/controller';
import snapshotSort from 'percy-web/lib/snapshot-sort';
import {snapshotsWithDiffForBrowser} from 'percy-web/lib/filtered-comparisons';
import {get, set, setProperties} from '@ember/object';

// NOTE: before adding something here, consider adding it to BuildContainer instead.
// This controller should only be used to maintain the state of which snapshots have been loaded.
export default class IndexController extends Controller {
  @service
  raven;

  @service
  launchDarkly;

  @service
  snapshotQuery;

  isHidingBuildContainer = false;
  allChangedBrowserSnapshotsSorted = null; // Manually managed by initializeSnapshotOrdering.
  _unchangedSnapshots = [];

  @action
  async fetchSnapshots(build) {
    await this.fetchSnapshotsWithSortOrder(build);
  }

  async fetchSnapshotsWithSortOrder(build) {
    const snapshotsAndMeta = await this.snapshotQuery.getSnapshotsWithSortMeta(build);
    const meta = snapshotsAndMeta.meta['sorted-items'];
    set(this, 'metadataSort', meta);
    set(this, 'isSnapshotsLoading', false);
  }

  // TODO(sort) remove this when old style is deprecated
  // This breaks the binding for allChangedBrowserSnapshotsSorted,
  // specifically so that when a user clicks
  // approve, the snapshot stays in place until reload.
  //
  // Called by the route when entered and snapshots load.
  // Called by polling when snapshots reload after build is finished.
  // Creates a hash with a keys of each browser id,
  // and the correctly ordered snapshots as the values and sets it as
  // allChangedBrowserSnapshotsSorted.
  initializeSnapshotOrdering() {
    if (!this.launchDarkly.variation('snapshot-sort-api')) {
      const orderedBrowserSnapshots = {};

      // Get snapshots without making new request
      const buildSnapshotsWithDiffs = this.store
        .peekAll('snapshot')
        .filterBy('build.id', get(this, 'build.id'))
        .filterBy('isChanged');
      const browsers = get(this, 'build.browsers');

      if (!browsers.length && get(this, 'raven.isRavenUsable')) {
        // There should always be browsers loaded, but there appears to be a certain race condition
        // when navigating from projects to builds where build relationships are not fully loaded.
        // Capture information about how often a race condition is happening. TODO: drop this.
        let error = new Error('Missing browsers in initializeSnapshotOrdering');
        this.raven.captureException(error);
      }

      browsers.forEach(browser => {
        const snapshotsWithDiffs = snapshotsWithDiffForBrowser(buildSnapshotsWithDiffs, browser);
        const sortedSnapshotsWithDiffs = snapshotSort(snapshotsWithDiffs.toArray(), browser);
        const approvedSnapshots = sortedSnapshotsWithDiffs.filterBy('isApprovedWithChanges');
        const unreviewedSnapshots = sortedSnapshotsWithDiffs.filterBy('isUnreviewed');
        const rejectedSnapshots = sortedSnapshotsWithDiffs.filterBy('isRejected');
        orderedBrowserSnapshots[browser.get('id')] = [].concat(
          rejectedSnapshots,
          unreviewedSnapshots,
          approvedSnapshots,
        );
      });

      setProperties(this, {
        allChangedBrowserSnapshotsSorted: orderedBrowserSnapshots,
        isSnapshotsLoading: false,
      });
    }
  }

  @action
  notifyOfUnchangedSnapshots(unchangedSnapshots) {
    set(this, '_unchangedSnapshots', unchangedSnapshots);
  }
}
