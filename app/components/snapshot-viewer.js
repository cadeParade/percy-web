import {filterBy, notEmpty, or, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import SnapshotListItem from 'percy-web/components/snapshot-list-item';
import {inject as service} from '@ember/service';

export default SnapshotListItem.extend({
  launchDarkly: service(),
  snapshot: null,
  showSnapshotFullModalTriggered: null,
  createReview: null,
  externalIsCommentPanelShowing: false,
  userIsCommentPanelShowing: undefined,

  attributeBindings: ['data-test-snapshot-viewer'],
  'data-test-snapshot-viewer': true,

  id: readOnly('snapshot.id'),
  coverSnapshot: readOnly('snapshot'),
  _isApproved: readOnly('snapshot.isApproved'),
  isUnchangedSnapshotExpanded: or('isFocus', 'isExpanded'),

  _internalIsCommentPanelShowing: notEmpty('commentThreads'),

  isCommentPanelShowing: computed(
    'userIsCommentPanelShowing',
    '_internalIsCommentPanelShowing',
    'externalIsCommentPanelShowing',
    function() {
      if (this.userIsCommentPanelShowing !== undefined) {
        return this.userIsCommentPanelShowing;
      } else {
        return this.defaultIsCommentPanelShowing;
      }
    },
  ),

  defaultIsCommentPanelShowing: or(
    '_internalIsCommentPanelShowing',
    'externalIsCommentPanelShowing',
  ),
  commentThreads: readOnly('snapshot.commentThreads'),
  openCommentThreads: filterBy('commentThreads', 'isOpen'),

  isSnapshotShowingDiffOverlay: true,
  actions: {
    toggleSnapshotOverlay() {
      this.toggleProperty('isSnapshotShowingDiffOverlay');
      this.trackToggleOverlay(this.isSnapshotShowingDiffOverlay);
    },

    toggleCollaborationPanel() {
      if (this.userIsCommentPanelShowing === undefined) {
        this.set('userIsCommentPanelShowing', !this.defaultIsCommentPanelShowing);
      } else {
        this.toggleProperty('userIsCommentPanelShowing');
      }
    },
  },
});
