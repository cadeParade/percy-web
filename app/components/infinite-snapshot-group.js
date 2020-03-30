import {computed, get} from '@ember/object';
import {filterBy, readOnly, notEmpty, not, and} from '@ember/object/computed';
import InfiniteSnapshotListItem from 'percy-web/components/infinite-snapshot-list-item';
import layout from 'percy-web/templates/components/snapshot-group';

export default InfiniteSnapshotListItem.extend({
  layout,
  snapshots: null,
  createCommentThread: null,
  createComment: null,
  closeCommentThread: null,

  areAllSnapshotsExpanded: false,
  isGroupCollapsed: not('areAllSnapshotsExpanded'),

  attributeBindings: ['data-test-snapshot-group'],
  'data-test-snapshot-group': true,

  isGroupShowingDiffOverlay: true,
  coverSnapshot: readOnly('snapshots.firstObject'),
  approvableSnapshots: filterBy('snapshots', 'isApproved', false),
  _unapprovedSnapshots: filterBy('snapshots', 'isApproved', false),
  numUnapprovedSnapshots: readOnly('_unapprovedSnapshots.length'),
  _isApproved: readOnly('isGroupApproved'),

  displaySingleSnapshotGroupCover: and('isGroupCollapsed', 'noSnapshotsWithOpenCommentThreads'),
  noSnapshotsWithOpenCommentThreads: not('hasUnreviewedSnapshotsWithOpenCommentThreads'),
  hasUnreviewedSnapshotsWithOpenCommentThreads: notEmpty(
    'unreviewedSnapshotsWithOpenCommentThreads',
  ),
  unreviewedSnapshotsWithOpenCommentThreads: filterBy(
    '_unapprovedSnapshots',
    'hasOpenCommentThreads',
  ),
  displayCommentedSnapshsotsGroupCover: and(
    'isGroupCollapsed',
    'hasUnreviewedSnapshotsWithOpenCommentThreads',
  ),
  snapshotsToDisplay: computed(
    'snapshots',
    'unreviewedSnapshotsWithOpenCommentThreads',
    'displayCommentedSnapshsotsGroupCover',
    function () {
      if (this.displayCommentedSnapshsotsGroupCover) {
        return this.unreviewedSnapshotsWithOpenCommentThreads;
      } else {
        return this.snapshots;
      }
    },
  ),

  isGroupApproved: computed('snapshots.@each.isApproved', function () {
    return get(this, 'snapshots').every(snapshot => {
      return get(snapshot, 'isApproved');
    });
  }),

  isGroupRejected: computed('snapshots.@each.isRejected', function () {
    return this.snapshots.any(snapshot => snapshot.isRejected);
  }),

  isGroupUnreviewed: computed('isGroupApproved', 'isGroupRejected', function () {
    return !this.isGroupApproved && !this.isGroupRejected;
  }),

  groupTitle: computed('snapshots.length', function () {
    return `${get(this, 'snapshots.length')} matching changes`;
  }),

  _toggleAreAllSnapshotsExpanded() {
    const build = get(this, 'build');
    this.toggleProperty('areAllSnapshotsExpanded');
    this.set('shouldOpenFirstCommentPanel', false);
    this.analytics.track('Group Toggled', get(build, 'project.organization'), {
      project_id: get(build, 'project.id'),
      build_id: get(build, 'id'),
      toggledTo: get(this, 'areAllSnapshotsExpanded') ? 'Open' : 'Collapsed',
    });
  },

  actions: {
    toggleGroupOverlay() {
      this.toggleProperty('isGroupShowingDiffOverlay');
      this.trackToggleOverlay(get(this, 'isGroupShowingDiffOverlay'));
    },

    toggleAreAllSnapshotsExpanded() {
      this._toggleAreAllSnapshotsExpanded();
    },
    handleCommentClick() {
      if (!this.areAllSnapshotsExpanded) {
        this._toggleAreAllSnapshotsExpanded();
      }
      this.toggleProperty('shouldOpenFirstCommentPanel');
    },
  },
});
