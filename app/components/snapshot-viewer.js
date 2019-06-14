import {get} from '@ember/object';
import {filterBy, notEmpty, or, readOnly} from '@ember/object/computed';
import SnapshotListItem from 'percy-web/components/snapshot-list-item';
import {inject as service} from '@ember/service';

export default SnapshotListItem.extend({
  snapshot: null,
  showSnapshotFullModalTriggered: null,
  createReview: null,
  launchDarkly: service(),

  attributeBindings: ['data-test-snapshot-viewer'],
  'data-test-snapshot-viewer': true,

  id: readOnly('snapshot.id'),
  coverSnapshot: readOnly('snapshot'),
  _isApproved: readOnly('snapshot.isApproved'),
  isUnchangedSnapshotExpanded: or('isFocus', 'isExpanded'),

  isCommentPanelShowing: notEmpty('openCommentThreads'),

  commentThreads: readOnly('snapshot.commentThreads'),
  openCommentThreads: filterBy('commentThreads', 'isOpen'),

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
