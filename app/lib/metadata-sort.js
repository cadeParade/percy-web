import EmberObject, {computed} from '@ember/object';
import {SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';

// This file handles and provides various ways to parse the data structure provided in the
// snapshot query metadata.

// sortData
// [
//   browser_family_slug: 'firefox',
//   default_browser_family_slug: false,
//   items: [
//     index: 0,
//     type: "snapshot",
//     items: [
//       {
//         id: 1,
//         attributes: {
//           review-state-reason: "unreviewed_comparisons"
//         },
//       }
//     ]
//     {
//       "index": 1,
//       "type": "group",
//       "items": [
//         {
//           "id": 2,
//           "type": "snapshot",
//           "attributes": {
//             "review-state-reason": "unreviewed_comparisons"
//           }
//         },
//         {
//           "id": 3,
//           "type": "snapshot",
//           "attributes": {
//             "review-state-reason": "unreviewed_comparisons"
//           }
//         }
//       ]
//     },
//   ]
// ]

// Items in a browser's `item` list are referred to as `blockItems`. This corresponds to how
// infinite-snapshot-list uses snapshot "blocks" to render EITHER a snapshot OR a group.

// Items in a `blockItem` that encapsulate a snapshot are referred to as `snapshotItems`.
// They represent a snapshot but are not actual snapshot objects.

export default class MetadataSort extends EmberObject {
  sortData = null;
  build = null;
  store = null;

  @computed('sortData')
  get defaultBrowserSlug() {
    const defaultBrowserData = this.sortData.findBy('default_browser_family_slug', true);
    return defaultBrowserData ? defaultBrowserData.browser_family_slug : 'chrome';
  }

  @computed()
  get blockItemsForBrowsers() {
    const browserItems = {};
    this.sortData.forEach(browserData => {
      browserItems[browserData.browser_family_slug] = browserData.items;
    });
    return browserItems;
  }

  @computed()
  get allSnapshots() {
    return this.sortData.reduce((acc, browserData) => {
      return browserData.items.reduce((acc, item) => {
        return acc.concat(item.items);
      }, []);
    }, []);
  }

  @computed()
  get allSnapshotsWithDiffsIds() {
    return this.allSnapshots.mapBy('id');
  }

  // {
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  // }
  snapshotItemsById(blockItems) {
    return blockItems.reduce((acc, orderItem) => {
      orderItem.items.forEach(item => {
        acc[item.id] = item;
      });
      return acc;
    }, {});
  }

  // {
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  // }
  @computed()
  get allSnapshotItemsById() {
    return this.sortData.reduce((acc, browserData) => {
      return this.snapshotItemsById(browserData.items);
    }, {});
  }

  // Take a set of blockItems and parse out all the ids we need to fetch.
  unloadedSnapshotIds(blockItems) {
    // Take our complex data structure and flatten all the ids.
    return idsFromOrderItems(blockItems).reject(id => {
      // exclude ids that are already in the store. Don't re-fetch them.
      return !!this._peekSnapshot(id);
    });
  }

  // Take an array of snapshots models and map them back to the structure provided
  // by blockItems.
  // This will be an array -- length of 1 for snapshots, length > 1 for groups.
  snapshotsToBlocks(blockItems) {
    return blockItems.map(orderItem => {
      const snapshots = orderItem.items.map(item => {
        return this._peekSnapshot(item.id);
      });
      return {
        snapshots,
        orderItem: orderItem,
      };
    });
  }

  _peekSnapshot(id) {
    return this.store.peekRecord('snapshot', id);
  }

  _getLoadedSnapshots() {
    return this.store.peekAll('snapshot').filterBy('build.id', this.build.id);
  }

  _unreviewedLoadedSnapshots() {
    const loadedSnapshotsForBuild = this._getLoadedSnapshots();
    return loadedSnapshotsForBuild.filter(snapshot => {
      return snapshot.get('isUnreviewed') && !snapshot.get('isUnchanged');
    });
  }

  // TODO(sort) i hate this
  unapprovedSnapshotsCountForBrowsers() {
    // Snapshots in the store that are unreviewed.
    const loadedSnapshots = this._getLoadedSnapshots();

    // Returns: {chrome: [snapshotItem, snapshotItem], firefox: [snapshotItem]}
    return this.sortData.reduce((acc, data) => {
      // Dictionary of snapshot sort items with id as key
      const snapshotItems = this.snapshotItemsById(data.items);

      // Remove items from dict that we have in the store AND are approved.
      loadedSnapshots.forEach(snapshot => {
        if (snapshot.isApproved) {
          delete snapshotItems[snapshot.id];
        }
      });

      // Only keep snapshot items that are in unreviewed state.
      const filtered = Object.values(snapshotItems).filter(item => {
        return item.attributes['review-state-reason'] === SNAPSHOT_REVIEW_STATE_REASONS.UNREVIEWED;
      });

      acc[data.browser_family_slug] = filtered;
      return acc;
    }, {});
  }
}

export function idsFromOrderItems(blockItems) {
  // Take our complex data structure and flatten all the ids.
  return blockItems.reduce((acc, item) => {
    return acc.concat(item.items.mapBy('id'));
  }, []);
}
