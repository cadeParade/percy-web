import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  store: service(),
  snapshotQuery: service(),
  limit: 2,

  didInsertElement() {
    this._super(...arguments);

    this.query.perform();
  },

  query: task(function*() {
    const offset = this.page * this.limit;
    const endIndex = (this.page + 1) * this.limit;

    const orderItemsToLoad = this.orderItems.slice(offset, endIndex);
    const idsToLoad = this._snapshotIdsToLoad(orderItemsToLoad);

    let fetchedSnapshots;
    if (idsToLoad.length > 0) {
      fetchedSnapshots = yield this.snapshotQuery.getSnapshots(idsToLoad, this.build.id);
    }
    // [
    //   {block: [snapshot, snapshot], orderItem: <orderItem>}
    //   {block: snapshot, orderItem: <orderItem>}
    // ]
    return this._snapshotsToBlocks(orderItemsToLoad, fetchedSnapshots);
  }),

  // Take a set of orderItems and parse out all the ids we need to fetch.
  _snapshotIdsToLoad(orderItems) {
    // Take our complex data structure and flatten all the ids.
    const ids = idsFromOrderItems(orderItems);

    // exclude ids that are already in the store. Don't re-fetch them.
    return ids.reduce((acc, id) => {
      const snapshot = this._peekSnapshot(id);
      if (!snapshot) {
        acc.push(id);
      }
      return acc;
    }, []);
  },

  // Take an array of snapshots we just fetched and map them back to the structure provided
  // by orderItems.
  // This will be an array for groups, or just a single snapshot otherwise.
  _snapshotsToBlocks(orderItems, snapshots) {
    return orderItems.map(item => {
      if (item.type === 'group') {
        const blockSnapshots = item['snapshot-ids'].map(id => {
          // TODO(sort): protect against a snapshot not being found (findBy will error?)
          return this._cachedOrFetchedSnapshot(snapshots, id.toString());
        });
        return {block: blockSnapshots, orderItem: item};
      } else {
        const snapshot = this._cachedOrFetchedSnapshot(snapshots, item['snapshot-id'].toString());
        return {block: snapshot, orderItem: item};
      }
    });
  },

  _cachedOrFetchedSnapshot(fetchedSnapshots, id) {
    let snapshot;
    snapshot = this._peekSnapshot(id);
    if (!snapshot) {
      snapshot = fetchedSnapshots.findBy('id', id);
    }
    return snapshot;
  },

  _peekSnapshot(id) {
    return this.store.peekRecord('snapshot', id);
  },
});

export function idsFromOrderItems(orderItems) {
  // Take our complex data structure and flatten all the ids.
  return orderItems.reduce((acc, item) => {
    if (item.type === 'group') {
      return acc.concat(item['snapshot-ids']);
    } else {
      acc.push(item['snapshot-id']);
      return acc;
    }
  }, []);
}
