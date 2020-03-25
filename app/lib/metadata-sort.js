import EmberObject, {computed} from '@ember/object';
import {SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';

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
  // TODO(sort) rename this to something better -- 'sortData' maybe?
  metadataSort = null;
  build = null;
  // TODO(sort) seems bad??
  store = null;

  @computed('metadataSort')
  get defaultBrowserSlug() {
    const defaultBrowserData = this.metadataSort.findBy('default_browser_family_slug', true);
    return defaultBrowserData ? defaultBrowserData.browser_family_slug : 'chrome';
  }

  @computed()
  get orderItemsForBrowsers() {
    const browserItems = {};
    this.metadataSort.forEach(browserData => {
      browserItems[browserData.browser_family_slug] = browserData.items;
    });
    return browserItems;
  }

  @computed()
  get allSnapshots() {
    return this.metadataSort.reduce((acc, browserData) => {
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
  snapshotItemsById(orderItems) {
    return orderItems.reduce((acc, orderItem) => {
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
  get allOrderItemsById() {
    return this.metadataSort.reduce((acc, browserData) => {
      return this.snapshotItemsById(browserData.items);
    }, {});
  }

  // Take a set of orderItems and parse out all the ids we need to fetch.
  unloadedSnapshotIds(orderItems) {
    // Take our complex data structure and flatten all the ids.
    return idsFromOrderItems(orderItems).reject(id => {
      // exclude ids that are already in the store. Don't re-fetch them.
      return !!this._peekSnapshot(id);
    });
  }

  // Take an array of snapshots models and map them back to the structure provided
  // by orderItems.
  // This will be an array -- length of 1 for snapshots, length > 1 for groups.
  snapshotsToBlocks(orderItems) {
    return orderItems.map(orderItem => {
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
  unapprovedSnapshotsForBrowsersCount() {
    // Snapshots in the store that are unreviewed.
    const loadedSnapshots = this._getLoadedSnapshots();

    // Returns: {chrome: [snapshotItem, snapshotItem], firefox: [snapshotItem]}
    return this.metadataSort.reduce((acc, data) => {
      // Dictionary of snapshot sort items with id as key
      const snapshotItems = this.snapshotItemsById(data.items);

      // Remove items from dict that we have in the store.
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

export function idsFromOrderItems(orderItems) {
  // Take our complex data structure and flatten all the ids.
  return orderItems.reduce((acc, item) => {
    return acc.concat(item.items.mapBy('id'));
  }, []);
}
