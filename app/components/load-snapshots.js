import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {SNAPSHOT_PAGINATION_COUNT} from 'percy-web/services/snapshot-query';

export default Component.extend({
  tagName: '',
  store: service(),
  snapshotQuery: service(),
  limit: SNAPSHOT_PAGINATION_COUNT,

  didInsertElement() {
    this._super(...arguments);

    this.query.perform();
  },

  query: task(function* () {
    const offset = this.page * this.limit;
    const endIndex = (this.page + 1) * this.limit;

    const orderItemsToLoad = this.orderItems.slice(offset, endIndex);
    const idsToLoad = this.build.sortMetadata.snapshotIdsToLoad(orderItemsToLoad);

    let fetchedSnapshots;
    if (idsToLoad.length > 0) {
      fetchedSnapshots = yield this.snapshotQuery.getSnapshots(idsToLoad, this.build.id);
    }
    // [
    //   {block: [snapshot, snapshot], orderItem: <orderItem>} // group
    //   {block: [snapshot], orderItem: <orderItem>} // snapshot
    // ]
    return this.build.sortMetadata.snapshotsToBlocks(orderItemsToLoad, fetchedSnapshots);
  }),
});
