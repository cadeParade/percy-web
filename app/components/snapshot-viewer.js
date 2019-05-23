import {get} from '@ember/object';
import {or, readOnly} from '@ember/object/computed';
import SnapshotListItem from 'percy-web/components/snapshot-list-item';

export default SnapshotListItem.extend({
  snapshot: null,
  showSnapshotFullModalTriggered: null,
  createReview: null,

  isCommentPanelShowing: false,

  attributeBindings: ['data-test-snapshot-viewer'],
  'data-test-snapshot-viewer': true,

  id: readOnly('snapshot.id'),
  coverSnapshot: readOnly('snapshot'),
  _isApproved: readOnly('snapshot.isApproved'),
  isUnchangedSnapshotExpanded: or('isFocus', 'isExpanded'),

  isSnapshotShowingDiffOverlay: true,
  actions: {
    toggleSnapshotOverlay() {
      this.toggleProperty('isSnapshotShowingDiffOverlay');
      this.trackToggleOverlay(get(this, 'isSnapshotShowingDiffOverlay'));
    },

    toggleCollaborationPanel() {
      this.toggleProperty('isCommentPanelShowing');
    },
  },
});
