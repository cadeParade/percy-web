import EmberObject, {computed} from '@ember/object';
import {SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';
import {set} from '@ember/object';

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
//           "review-state-reason": "unreviewed_comparisons",
//           "total-open-comments": 1
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
//             "review-state-reason": "unreviewed_comparisons",
//             "total-open-comments": 0,
//           }
//         },
//         {
//           "id": 3,
//           "type": "snapshot",
//           "attributes": {
//             "review-state-reason": "unreviewed_comparisons",
//             "total-open-comments": 0,
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

// Also in this class is a frequent idea of "loaded" and "unloaded" snapshots.
// A "loaded" snapshot is one that has is fully in the ember-data store. We have all the information
// stored on a snapshot.
// An "unloaded" snapshot is one that is referred to by the sort metadata object but is not yet
// loaded into the ember data store.
// In order to get the full, up-to-date picture of which snapshots are in which state for a build,
// we need to compile all the loaded snapshots (aka, ones that might have changed state with a
// local approval) and all the unloaded snapshots (those that probably haven't changed). We can't
// count a snapshot twice and we can't assume that the data originally presented in sort metadata
// is up to date after the initial load.
// This looks something like:
//   - Get some block items
//   - Parse out all snapshot ids from the block items
//   - Look in the store to see which of those ids are present
//   - Delete the "loaded" snapshot ids from the list of block item ids
//   - Do your counting/filtering based on the combination of "loaded" and "unloaded" snapshots.

export default class MetadataSort extends EmberObject {
  changedSortData = null;
  build = null;
  store = null;

  @computed('changedSortData')
  get defaultBrowserSlug() {
    const defaultBrowserData = this.changedSortData.findBy('default_browser_family_slug', true);
    return defaultBrowserData ? defaultBrowserData.browser_family_slug : 'chrome';
  }

  @computed('changedSortData')
  get blockItemsForBrowsers() {
    const browserItems = {};
    this.changedSortData.forEach(browserData => {
      browserItems[browserData.browser_family_slug] = browserData.items;
    });
    return browserItems;
  }

  @computed('unchangedSortData.[]')
  get unchangedBlockItemsForBrowsers() {
    if (!this.unchangedSortData) return [];
    const browserItems = {};
    this.unchangedSortData.forEach(browserData => {
      browserItems[browserData.browser_family_slug] = browserData.items;
    });

    return browserItems;
  }

  // {
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  //   <id>: {id: <id>, type: "snapshot", attributes: {…}}
  // }
  @computed()
  get allChangedSnapshotItemsById() {
    return this.changedSortData.reduce((acc, browserData) => {
      return this.snapshotItemsById(browserData.items);
    }, {});
  }

  @computed('unloadedSnapshotItemsById.[]')
  get anyUnloadedSnapshotItemsRejected() {
    return Object.values(this.unloadedSnapshotItemsById).any(isSnapshotItemRejected);
  }

  // Returns: {chrome: [snapshotItem, snapshotItem], firefox: [snapshotItem]}
  @computed('loadedSnapshots.@each.reviewState')
  get unapprovedSnapshotItemsForBrowsers() {
    return this.changedSortData.reduce((acc, data) => {
      // Dictionary of snapshot sort items with id as key
      const snapshotItems = this.snapshotItemsById(data.items);

      // Remove items from dict that we have in the store AND are approved.
      this.loadedSnapshots.forEach(snapshot => {
        if (snapshot.isApproved) {
          delete snapshotItems[snapshot.id];
        }
      });

      // Only keep snapshot items that are in unreviewed state.
      const filtered = Object.values(snapshotItems).filter(isSnapshotItemUnreviewed);

      acc[data.browser_family_slug] = filtered;
      return acc;
    }, {});
  }

  // This computed property allows properties that observe it to basically
  // observe the store. This is recalculated whenever a snapshot changes in the store.
  @computed()
  get _allSnapshots() {
    return this.store.peekAll('snapshot');
  }

  @computed('_allSnapshots.@each.reviewState', 'build.id')
  get loadedSnapshots() {
    return this._allSnapshots.filterBy('build.id', this.build.id);
  }

  @computed('loadedSnapshots.@each.id', 'allChangedSnapshotItemsById.[]')
  get unloadedSnapshotItemsById() {
    const changedSnapshotItemsById = this.allChangedSnapshotItemsById;
    this.loadedSnapshots.mapBy('id').forEach(id => {
      delete changedSnapshotItemsById[id];
    });
    return changedSnapshotItemsById;
  }

  @computed('loadedSnapshots.@each.reviewState')
  get unreviewedLoadedSnapshots() {
    return this.loadedSnapshots.filterBy('isUnreviewed');
  }

  // Take a set of blockItems and return those not in the store.
  unloadedSnapshotIds(blockItems) {
    // Take our complex data structure and flatten all the ids.
    return idsFromOrderItems(blockItems).reject(id => {
      // exclude ids that are already in the store.
      return !!this._peekSnapshot(id);
    });
  }

  _peekSnapshot(id) {
    return this.store.peekRecord('snapshot', id);
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

  handleUnchangedSortData(unchangedSortData) {
    unchangedSortData.forEach(browserData => {
      const browserSlug = browserData.browser_family_slug;
      const changedSortData = this.changedSortData.findBy('browser_family_slug', browserSlug);
      const startingIndex = this._lastIndex(changedSortData) + 1;
      browserData.items.forEach((item, i) => {
        set(item, 'index', startingIndex + i);
      });
    });
    set(this, 'unchangedSortData', unchangedSortData);
  }

  _lastIndex(changedSortData) {
    // If there are no items, start at -1 so when we add 1, it is 0.
    const items = changedSortData.items;
    if (items.length === 0) return -1;

    // Otherwise, return the last index for the browser.
    return items[items.length - 1].index;
  }
}

export function snapshotItemHasComments(snapshotItem) {
  return snapshotItem.attributes['total-open-comments'] > 0;
}

function isSnapshotItemUnreviewed(snapshotItem) {
  return (
    snapshotItem.attributes['review-state-reason'] === SNAPSHOT_REVIEW_STATE_REASONS.UNREVIEWED
  );
}

function isSnapshotItemRejected(snapshotItem) {
  const reviewState = snapshotItem.attributes['review-state-reason'];
  const isRejected = reviewState === SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED;
  const isRejectedPreviously =
    reviewState === SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED_PREVIOUSLY;
  return isRejected || isRejectedPreviously;
}

export function idsFromOrderItems(blockItems) {
  // Take our complex data structure and flatten all the ids.
  return blockItems.reduce((acc, item) => {
    return acc.concat(item.items.mapBy('id'));
  }, []);
}
