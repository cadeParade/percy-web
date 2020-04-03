import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {SNAPSHOT_PAGINATION_COUNT} from 'percy-web/services/snapshot-query';
import {snapshotItemHasComments} from 'percy-web/lib/sort-metadata';

export default Component.extend({
  tagName: '',
  store: service(),
  snapshotQuery: service(),
  commentThreads: service(),
  limit: SNAPSHOT_PAGINATION_COUNT,

  didReceiveAttrs() {
    this._super(...arguments);

    this.fetchSnapshots.perform();
    this.fetchComments.perform();
  },

  blockItemsToLoad: computed('page', 'limit', 'blockItems.[]', function () {
    if (!this.blockItems) return [];

    const offset = this.page * this.limit;
    const endIndex = (this.page + 1) * this.limit;

    return this.blockItems.slice(offset, endIndex);
  }),

  fetchSnapshots: task(function* () {
    const idsToLoad = this.build.sortMetadata.unloadedSnapshotIds(this.blockItemsToLoad);

    if (idsToLoad.length > 0) {
      yield this.snapshotQuery.getSnapshots(idsToLoad, this.build.id);
    }
    // [
    //   {snapshots: [snapshot, snapshot], orderItem: <orderItem>} // group
    //   {snapshots: [snapshot], orderItem: <orderItem>} // snapshot
    // ]
    return this.build.sortMetadata.snapshotsToBlocks(this.blockItemsToLoad);
  }),

  fetchComments: task(function* () {
    const blockItemsToLoad = this.blockItemsToLoad;
    const snapshotItems = this.build.sortMetadata.snapshotItemsById(blockItemsToLoad);
    const idsWithComments = snapshotIdsWithComments(snapshotItems);
    if (idsWithComments.length === 0) return;
    yield this.commentThreads.getCommentsForSnapshotIds(idsWithComments, this.build);
  }),
});

function snapshotIdsWithComments(snapshotItems) {
  return Object.entries(snapshotItems).reduce((acc, [snapshotId, snapshotItem]) => {
    if (snapshotItemHasComments(snapshotItem)) {
      acc.push(snapshotId);
    }
    return acc;
  }, []);
}
