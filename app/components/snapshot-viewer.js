import {or, readOnly} from '@ember/object/computed';
import SnapshotListItem from 'percy-web/components/snapshot-list-item';

export default SnapshotListItem.extend({
  snapshot: null,
  showSnapshotFullModalTriggered: null,
  createReview: null,

  attributeBindings: ['data-test-snapshot-viewer'],
  'data-test-snapshot-viewer': true,

  id: readOnly('snapshot.id'),
  coverSnapshot: readOnly('snapshot'),
  _isApproved: readOnly('snapshot.isApproved'),
  isUnchangedSnapshotExpanded: or('isFocus', 'isExpanded'),
});
