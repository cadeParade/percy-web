// TODO groups
export default function createSortMetadata(mirageSnapshots, mirageBuild) {
  var sortMetadata = {'sorted-items': []};
  var browsers = mirageBuild.browsers.models;
  browsers.forEach(browser => {
    const browserData = {
      browser_family_slug: browser.id.split('-')[0],
      default_browser_family_slug: true,
      items: mirageSnapshots.models.map((snapshot, i) => {
        return {
          index: i,
          type: 'snapshot',
          'snapshot-id': snapshot.id,
        };
      }),
    };
    sortMetadata['sorted-items'].push(browserData);
  });

  // 'sorted-items': [
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

  return sortMetadata;
}
