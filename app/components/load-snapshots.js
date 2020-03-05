import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  store: service(),
  snapshotQuery: service(),
  limit: 2,

  // orderItems: null
  // build: null

  // page 0, limit 2 -- offset 0, end is 2
  // page 1, limit 2 -- offset 2, end is 4
  // page 2, limit 2 -- offset 4, end is 6
  // page 3, limit 2 -- offset 6, end is 8

  didInsertElement() {
    this._super(...arguments);

    this.query.perform();
  },

  query: task(function*() {
    const offset = this.page * this.limit;
    const endIndex = (this.page + 1) * this.limit;

    const orderItemsToLoad = this.orderItems.slice(offset, endIndex);
    const idsToLoad = snapshotIdsToLoad(orderItemsToLoad);

    if (idsToLoad.length === 0) return;

    const snapshots = yield this.snapshotQuery.getSnapshots(idsToLoad, this.build.id);

    // [
    //   {block: [snapshot, snapshot], orderItem: <orderItem>}
    //   {block: snapshot, orderItem: <orderItem>}
    // ]
    return snapshotsToBlocks(orderItemsToLoad, snapshots);
  }),
});

// Take an array of snapshots we just fetched and map them back to the structure provided
// by orderItems.
// This will be an array for groups, or just a single snapshot otherwise.
function snapshotsToBlocks(orderItems, snapshots) {
  return orderItems.map(item => {
    if (item.type === 'group') {
      const blockSnapshots = item['snapshot-ids'].map(id => {
        // TODO: protect against a snapshot not being found (findBy will error?)
        return snapshots.findBy('id', id.toString());
      });
      return {block: blockSnapshots, orderItem: item};
    } else {
      return {block: snapshots.findBy('id', item['snapshot-id'].toString()), orderItem: item};
    }
  });
}

// Take a set of orderItems and parse out all the ids we need to fetch.
function snapshotIdsToLoad(orderItems) {
  return orderItems.reduce((acc, item) => {
    if (item.type === 'group') {
      return acc.concat(item['snapshot-ids']);
    } else {
      acc.push(item['snapshot-id']);
      return acc;
    }
  }, []);
}
