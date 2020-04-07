import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Controller from '@ember/controller';
import {set} from '@ember/object';
import metadataSort from 'percy-web/lib/sort-metadata';

export default class IndexController extends Controller {
  isUnchangedSnapshotsLoading = false;

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
    set(this, 'isUnchangedSnapshotsLoading', true);
    const snapshotsAndMeta = await this.snapshotQuery.getUnchangedSnapshotsWithSortMeta(this.build);
    build.sortMetadata.handleUnchangedSortData(snapshotsAndMeta.meta['sorted-items']);
    set(this, 'isUnchangedSnapshotsLoading', false);
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
