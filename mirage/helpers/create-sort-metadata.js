import {get} from '@ember/object';

// TODO groups
// TODO(sort) divide by browser :/
// TODO(sort) correct default browser??
export default function createSortMetadata(mirageSnapshots, mirageBuild) {
  var sortMetadata = {'sorted-items': []};
  var browsers = mirageBuild.browsers.models;
  const fingerprintDictOfIndexes = _groupSnapshotIndexesByFingerprint(mirageSnapshots.models);
  const {singleIndexes, groupedIndexes} = _separateSingleIndexes(fingerprintDictOfIndexes);
  browsers.forEach((browser, i) => {
    const groups = Object.keys(groupedIndexes).map((key, i) => {
      return {
        index: i,
        type: 'group',
        'snapshot-ids': groupedIndexes[key],
      };
    });
    const singles = singleIndexes.map((snapshotId, i) => {
      return {
        index: groups.length + i,
        type: 'snapshot',
        'snapshot-id': snapshotId,
      };
    });
    const items = groups.concat(singles);

    const browserData = {
      browser_family_slug: browser.id.split('-')[0],
      default_browser_family_slug: i === 0,
      items: items,
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

function _groupSnapshotIndexesByFingerprint(snapshots) {
  const fingerprintDictOfIndexes = {};

  snapshots.forEach(snapshot => {
    const fingerprint = get(snapshot, 'fingerprint');

    if (fingerprint in fingerprintDictOfIndexes) {
      fingerprintDictOfIndexes[fingerprint].push(snapshot.id);
    } else {
      fingerprintDictOfIndexes[fingerprint] = [snapshot.id];
    }
  });
  return fingerprintDictOfIndexes;
}

function _separateSingleIndexes(groupedSnapshotIndexes) {
  const singleIndexes = [];
  Object.keys(groupedSnapshotIndexes).forEach(fingerprint => {
    const snapshots = groupedSnapshotIndexes[fingerprint];
    const isSingleSnapshot = snapshots.length === 1;
    const isFingerprintUndefined = fingerprint === 'null' || fingerprint === 'undefined';
    if (isSingleSnapshot || isFingerprintUndefined) {
      singleIndexes.push.apply(singleIndexes, snapshots);
      delete groupedSnapshotIndexes[fingerprint];
    }
  });

  return {singleIndexes, groupedIndexes: groupedSnapshotIndexes};
}
