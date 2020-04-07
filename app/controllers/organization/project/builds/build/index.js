import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Controller from '@ember/controller';
import {set} from '@ember/object';
import metadataSort from 'percy-web/lib/sort-metadata';

// NOTE: before adding something here, consider adding it to BuildContainer instead.
// This controller should only be used to maintain the state of which snapshots have been loaded.
export default class IndexController extends Controller {
  @service
  raven;

  @service
  launchDarkly;

  @service
  snapshotQuery;

  @action
  async fetchChangedSnapshots(build) {
    await this.fetchChangedSnapshotsWithSortOrder(build);
  }

  @action
  async fetchUnchangedSnapshots(build) {
    const snapshotsAndMeta = await this.snapshotQuery.getUnchangedSnapshotsWithSortMeta(this.build);
    build.sortMetadata.handleUnchangedSortData(snapshotsAndMeta.meta['sorted-items']);
    set(this, 'isUnchangedSnapshotsVisible', true);
  }

  async fetchChangedSnapshotsWithSortOrder(build) {
    set(this, 'isSnapshotsLoading', true);
    const snapshotsAndMeta = await this.snapshotQuery.getChangedSnapshotsWithSortMeta(build);
    const meta = snapshotsAndMeta.meta['sorted-items'];
    const sortObject = metadataSort.create({changedSortData: meta, build, store: this.store});
    this.build.setProperties({sortMetadata: sortObject});
    set(this, 'isSnapshotsLoading', false);
  }
}
