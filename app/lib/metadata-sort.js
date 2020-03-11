import {notEmpty, filterBy, or, alias} from '@ember/object/computed';
import Object, {get, set, computed} from '@ember/object';

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
    // const
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
