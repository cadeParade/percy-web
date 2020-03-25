import EmberObject from '@ember/object';
import {computed} from '@ember/object';

// This file handles and provides various ways to parse the data structure provided in the
// snapshot query metadata.

// metadataSort
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

export default class MetadataSort extends EmberObject {
  metadataSort = null;
  // TODO(sort) seems bad??
  store = null;

  @computed('metadataSort')
  get defaultBrowserSlug() {
    const defaultBrowserData = this.metadataSort.findBy('default_browser_family_slug', true);
    if (defaultBrowserData) {
      return defaultBrowserData.browser_family_slug;
    } else {
      return 'chrome';
    }
  }

  orderItemsForBrowser(activeBrowserFamilySlug) {
    const browserInfo = this.metadataSort.findBy('browser_family_slug', activeBrowserFamilySlug);
    return browserInfo.items;
  }

  snapshotIdsForBrowser(browserSlug) {
    const orderItems = this.orderItemsForBrowser(browserSlug);
    return idsFromOrderItems(orderItems);
  }

  @computed()
  get allSnapshotsWithDiffsIds() {
    return Object.keys(this.allOrderItemsById);
  }

  @computed()
  // {
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  // }
  get allOrderItemsById() {
    return this.metadataSort.reduce((acc, browserData) => {
      return browserData.items.reduce((acc, item) => {
        item.items.forEach(item => {
          acc[item.id] = item;
        });
        return acc;
      }, {});
    }, {});
  }

  // Take a set of orderItems and parse out all the ids we need to fetch.
  snapshotIdsToLoad(orderItems) {
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
  }

  // Take an array of snapshots models and map them back to the structure provided
  // by orderItems.
  // This will be an array -- length of 1 for snapshots, length > 1 for groups.
  snapshotsToBlocks(orderItems, snapshots) {
    return orderItems.map(orderItem => {
      const block = orderItem.items.map(item => {
        return this._cachedOrFetchedSnapshot(snapshots, item.id.toString());
      });
      return {
        block,
        orderItem: orderItem,
      };
    });
  }

  _cachedOrFetchedSnapshot(fetchedSnapshots, id) {
    let snapshot;
    snapshot = this._peekSnapshot(id);
    if (!snapshot) {
      snapshot = fetchedSnapshots.findBy('id', id);
    }
    return snapshot;
  }

  _peekSnapshot(id) {
    return this.store.peekRecord('snapshot', id);
  }
}

export function idsFromOrderItems(orderItems) {
  // Take our complex data structure and flatten all the ids.
  return orderItems.reduce((acc, item) => {
    return acc.concat(item.items.mapBy('id'));
  }, []);
}
