import {get} from '@ember/object';
import {SNAPSHOT_APPROVED_STATE} from 'percy-web/models/snapshot';

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
//       index: 0,
//       id: 1,
//       type: "snapshot",
//       attributes: {
//         review-state-reason: "unreviewed_comparisons"
//       },
//       {
//         "index": 1,
//         "type": "group",
//         "items": [
//           {
//             "id": 2,
//             "type": "snapshot",
//             "attributes": {
//               "review-state-reason": "unreviewed_comparisons"
//             }
//           },
//           {
//             "id": 3,
//             "type": "snapshot",
//             "attributes": {
//               "review-state-reason": "unreviewed_comparisons"
//             }
//           }
//         ]
//       },
//     ]
//   },
//   {
//     browser_family_slug: 'chrome',
//     default_browser_family_slug: true,
//     items: [
///      {
//         "id": 3,
//         "type": "snapshot",
//         "attributes": {
//           "review-state-reason": "unreviewed_comparisons"
//         }
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
      const items = groupedIndexes[key].map(snapshotId => {
        return {
          id: snapshotId,
          type: 'snapshot',
          attributes: {
            // eslint-disable-next-line
            'review-state-reason': server.db.snapshots.find(snapshotId).reviewStateReason,
          },
        };
      });

      return {
        index: i,
        type: 'group',
        items,
      };
    });
    const singles = singleIndexes.map((snapshotId, i) => {
      return {
        index: groups.length + i,
        type: 'snapshot',
        items: [
          {
            id: snapshotId,
            type: 'snapshot',
            attributes: {
              // eslint-disable-next-line
              'review-state-reason': server.db.snapshots.find(snapshotId).reviewStateReason,
            },
          },
        ],
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
  return sortMetadata;
}

function separateGroups(groupOrderItems) {
  return groupOrderItems.reduce(
    (acc, groupOrderItem) => {
      const snapshots = groupOrderItem.items.map(item => {
        // eslint-disable-next-line
        return server.db.snapshots.find(item.id);
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
      // eslint-disable-next-line
      const snapshot = server.db.snapshots.find(snapshotOrderItem.items[0].id);
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
    const hasDiff = comparison.diffRatio && comparison.diffRatio > 0;
    const isNew = !comparison.baseScreenshot;
    return hasDiff || isNew;
  });
}

function comparisonsForBrowser(comparisons, browser) {
  return comparisons.filterBy('browser.id', browser.id);
}

function snapshotSort(snapshots, browser) {
  return snapshots.sort((a, b) => {
    const maxDiffRatioA = maxDiffRatioForBrowser(a, browser);
    const maxDiffRatioB = maxDiffRatioForBrowser(b, browser);
    return maxDiffRatioB - maxDiffRatioA;
  });
}

function maxDiffRatioForBrowser(snapshot, browser) {
  const ratios = comparisonsForBrowser(snapshot.comparisons.models, browser).map(comparison => {
    return comparison.diffRatio;
  });
  return _numericSort(ratios).reverse()[0];
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
