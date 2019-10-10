import {clickable, create, collection} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-removed-snapshots]',
  MISSING_SNAPSHOT_LINK: '[data-test-removed-snapshot-link]',
  TOGGLE_NAMES: '[data-test-toggle-snapshots]',
};

export const RemovedSnapshots = {
  scope: SELECTORS.SCOPE,
  snapshotNames: collection(SELECTORS.MISSING_SNAPSHOT_LINK),
  toggleSnapshots: clickable(SELECTORS.TOGGLE_NAMES),
};

export default create(RemovedSnapshots);
