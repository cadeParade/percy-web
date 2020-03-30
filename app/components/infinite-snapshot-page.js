import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {SNAPSHOT_PAGINATION_COUNT} from 'percy-web/services/snapshot-query';

export default Component.extend({
  tagName: '',
  store: service(),
  snapshotQuery: service(),
  limit: SNAPSHOT_PAGINATION_COUNT,

  didReceiveAttrs() {
    this._super(...arguments);

    this.query.perform();
  },

  query: task(function* () {
    const offset = this.page * this.limit;
    const endIndex = (this.page + 1) * this.limit;

    const blockItemsToLoad = this.blockItems.slice(offset, endIndex);
    const idsToLoad = this.build.sortMetadata.unloadedSnapshotIds(blockItemsToLoad);

    if (idsToLoad.length > 0) {
      yield this.snapshotQuery.getSnapshots(idsToLoad, this.build.id);
    }
    // [
    //   {snapshots: [snapshot, snapshot], orderItem: <orderItem>} // group
    //   {snapshots: [snapshot], orderItem: <orderItem>} // snapshot
    // ]
    return this.build.sortMetadata.snapshotsToBlocks(blockItemsToLoad);
  }),
});
