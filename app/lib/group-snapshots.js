import {get} from '@ember/object';

// This method is assuming the snapshots are already sorted in a desireable order
// and goes to great lengths to keep them in the order they arrived, within their groups
// and also uses this order to sort the groups.

// _groupSnapshotIndexesByFingerprint
// First we create a dictionary of fingerprints with an array of snapshot indexes as the values:
// ex:
// {
//   fingerprint1: [1,3,9],
//   fingerprint2: [5,6],
//   fingerprint3: [2],
//   fingerprint4: [7],
//   null: [4,8,10]
// }

// _separateSingleIndexes
// Then we separate out fingerprints with null, undefined, or a single index in their lists.
// Compiling them this way loses the order they originally came in. We'll sort (eh?) this out later.
// Returning from this function is an object with two keys -- singleIndexes and groupedIndexes.
// From here on we treat them separately.

// _numericSort
// We sort the "singles" array by index, low to high. Now all the indicies are in the same order
// as which they came.
// NOTE: We do not need to sort the grouped fingerprint snapshot arrays, as the indicies in them
// should have been inserted in the correct order already.

// _groupSort
// We want the groups to be in a deterministic order (no longer an array of dict keys). We first
// turn the dict into an array, then sort the groups by:
// - The length of the snapshots. More snapshots come first.
// - If two groups have the same number of snapshots, sort by the index of the first snapshot.
//   The lower the index of the first snapshot, the more important our original `snapshotSort`
//   deemed it based on a large number of things including diff ratio, comparison width
//   and active browser.

// _populateGroups/_populateArrayByIndex
// Finally, we go through all of our sorted arrays and get the snapshot at the corresponding index.
// Now all arrays are populated with actual snapshot objects in the correct order.

export default function groupSnapshots(orderedSnapshots) {
  // Group all snapshots by fingerprint. Store the snapshots as indicies for now.
  const fingerprintDictOfIndexes = _groupSnapshotIndexesByFingerprint(orderedSnapshots);

  // Separate the groups which have only one item, or a null or undefined fingerprint.
  const {singleIndexes, groupedIndexes} = _separateSingleIndexes(fingerprintDictOfIndexes);

  // Sort them!
  const sortedSingleIndexes = _numericSort(singleIndexes);
  const sortedGroupedIndexes = _groupSort(groupedIndexes);

  // Go back and get the snapshots correlated with the indices
  const sortedSingleSnapshots = _populateArrayByIndex(sortedSingleIndexes, orderedSnapshots);
  const sortedGroupedSnapshots = _populateGroups(sortedGroupedIndexes, orderedSnapshots);

  return {singles: sortedSingleSnapshots, groups: sortedGroupedSnapshots};
}

function _groupSnapshotIndexesByFingerprint(snapshots) {
  const fingerprintDictOfIndexes = {};

  snapshots.forEach((snapshot, i) => {
    const fingerprint = get(snapshot, 'fingerprint');

    if (fingerprint in fingerprintDictOfIndexes) {
      fingerprintDictOfIndexes[fingerprint].push(i);
    } else {
      fingerprintDictOfIndexes[fingerprint] = [i];
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

function _groupSort(groupedSnapshotIndexes) {
  const groupsArray = Object.keys(groupedSnapshotIndexes).map(key => {
    return groupedSnapshotIndexes[key];
  });

  return groupsArray.sort((a, b) => {
    if (a.length > b.length) {
      return -1;
    } else if (b.length > a.length) {
      return 1;
    }

    return a[0] - b[0];
  });
}

function _populateArrayByIndex(indexArray, populationPool) {
  return indexArray.map(index => {
    return populationPool[index];
  });
}

function _populateGroups(indexGroups, populationPool) {
  return indexGroups.map(group => {
    return _populateArrayByIndex(group, populationPool);
  });
}
