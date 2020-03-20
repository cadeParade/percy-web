import Object, {computed} from '@ember/object';

// metadataSort
// [
//   browser_family_slug: 'firefox',
//   default_browser_family_slug: false,
//   items: [
//     {
//       index: 0,
//       type: 'group',
//       'snapshot-ids': [1,2,3]
//     }
//   ]
// ]

export default class MetadataSort extends Object {
  metadataSort = null;

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
    const ids = this.metadataSort.reduce((acc, browserData) => {
      const ids = this.snapshotIdsForBrowser(browserData.browser_family_slug);
      return acc.concat(ids);
    }, []);
    return ids.uniq();
  }
}

function idsFromOrderItems(orderItems) {
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
