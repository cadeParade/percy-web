import {get} from '@ember/object';
import {SNAPSHOT_APPROVED_STATE} from 'percy-web/models/snapshot';
// TODO groups
// TODO(sort) divide by browser :/
// TODO(sort) correct default browser??

// This method creates the sort metadata object that comes back when a snapshot request includes
// include-sort-data: true query param.
// The API has LOADS of sort logic that goes into the sort metadata object, and we don't want to
// duplicate it ALL here. So we have comprimised and are sorting here only by group and diff ratio.
// The things we are NOT sorting by here are: changes requested, comment count, comparison width.
// The ouput takes this form:

// 'sorted-items': [
//   {
//     browser_family_slug: 'firefox',
//     default_browser_family_slug: false,
//     items: [
//       {
//         index: 0,
//         type: 'group',
//         'snapshot-ids': [1,2,3]
//       }
//     ]
//   },
//   {
//     browser_family_slug: 'chrome',
//     default_browser_family_slug: true,
//     items: [
//       {
//         index: 0,
//         type: 'snapshot',
//         'snapshot-id': 4,
//       }
//     ]
//   },
// ]

export default function createSortMetadata(mirageSnapshots, mirageBuild) {
  const sortMetadata = {'sorted-items': []};
  const browsers = mirageBuild.browsers.models;
  browsers.forEach((browser, i) => {
    const snapshotsForBrowser = sortedSnapshotsWithDiffForBrowser(mirageSnapshots.models, browser);
    const fingerprintDictOfIndexes = _groupSnapshotIndexesByFingerprint(snapshotsForBrowser);
    const {singleIndexes, groupedIndexes} = _separateSingleIndexes(fingerprintDictOfIndexes);
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

    const {approvedSnapshots, unapprovedSnapshots} = separateSnapshots(singles);
    const {approvedGroups, unapprovedGroups} = separateGroups(groups);

    const items = unapprovedGroups.concat(unapprovedSnapshots, approvedGroups, approvedSnapshots);

    const browserData = {
      browser_family_slug: browser.id.split('-')[0],
      default_browser_family_slug: i === 0,
      items: items,
    };
    sortMetadata['sorted-items'].push(browserData);
  });
  console.log(sortMetadata);
  return sortMetadata;
}

function separateGroups(groupOrderItems) {
  return groupOrderItems.reduce(
    (acc, groupOrderItem) => {
      const snapshots = groupOrderItem['snapshot-ids'].map(snapshotId => {
        return server.db.snapshots.find(snapshotId);
      });
      const areAllApproved = snapshots.every(snapshot => {
        return snapshot.reviewState === SNAPSHOT_APPROVED_STATE;
      });
      areAllApproved
        ? acc.approvedGroups.push(groupOrderItem)
        : acc.unapprovedGroups.push(groupOrderItem);
      return acc;
    },
    {approvedGroups: [], unapprovedGroups: []},
  );
}

function separateSnapshots(snapshotsOrderItems) {
  return snapshotsOrderItems.reduce(
    (acc, snapshotOrderItem) => {
      const snapshot = server.db.snapshots.find(snapshotOrderItem['snapshot-id']);
      snapshot.reviewState === SNAPSHOT_APPROVED_STATE
        ? acc.approvedSnapshots.push(snapshotOrderItem)
        : acc.unapprovedSnapshots.push(snapshotOrderItem);
      return acc;
    },
    {approvedSnapshots: [], unapprovedSnapshots: []},
  );
}

function sortedSnapshotsWithDiffForBrowser(snapshots, browser) {
  const snapshotsWithDiffs = snapshots.filter(snapshot => {
    return hasDiffForBrowser(snapshot, browser);
  });
  return snapshotSort(snapshotsWithDiffs, browser);
}

function hasDiffForBrowser(snapshot, browser) {
  return comparisonsForBrowser(snapshot.comparisons.models, browser).any(comparison => {
    return comparison.diffRatio && comparison.diffRatio > 0;
  });
}

function comparisonsForBrowser(comparisons, browser) {
  return comparisons.filterBy('browser.id', browser.id);
}

function snapshotSort(snapshots, browser) {
  const x = snapshots.sort((a, b) => {
    const maxDiffRatioA = maxDiffRatioForBrowser(a, browser);
    const maxDiffRatioB = maxDiffRatioForBrowser(b, browser);
    return maxDiffRatioB - maxDiffRatioA;
  });
  return x;
}

function maxDiffRatioForBrowser(snapshot, browser) {
  const ratios = comparisonsForBrowser(snapshot.comparisons.models, browser).map(comparison => {
    return comparison.diffRatio;
  });
  const x = _numericSort(ratios).reverse();
  return x[0];
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

function _numericSort(list) {
  return list.sort((a, b) => a - b);
}
