import {computed, get} from '@ember/object';
import {filterBy, readOnly} from '@ember/object/computed';
import SnapshotListItem from 'percy-web/components/snapshot-list-item';

export default SnapshotListItem.extend({
  snapshots: null,

  areAllSnapshotsExpanded: false,

  attributeBindings: ['data-test-snapshot-group'],
  'data-test-snapshot-group': true,

  isGroupShowingDiffOverlay: true,
  id: readOnly('snapshots.firstObject.fingerprint'),
  coverSnapshot: readOnly('snapshots.firstObject'),
  approvableSnapshots: filterBy('snapshots', 'isUnreviewed'),
  _unapprovedSnapshots: filterBy('snapshots', 'isUnreviewed'),
  numUnapprovedSnapshots: readOnly('_unapprovedSnapshots.length'),
  _isApproved: readOnly('isGroupApproved'),

  isGroupApproved: computed('snapshots.@each.isApproved', function() {
    return get(this, 'snapshots').every(snapshot => {
      return get(snapshot, 'isApproved');
    });
  }),

  groupTitle: computed('snapshots.length', function() {
    return `${get(this, 'snapshots.length')} matching changes`;
  }),

  actions: {
    toggleGroupOverlay() {
      this.toggleProperty('isGroupShowingDiffOverlay');
      this.trackToggleOverlay(get(this, 'isGroupShowingDiffOverlay'));
    },

    toggleAreAllSnapshotsExpanded() {
      const build = get(this, 'build');
      this.toggleProperty('areAllSnapshotsExpanded');
      this.get('analytics').track('Group Toggled', get(build, 'project.organization'), {
        project_id: get(build, 'project.id'),
        build_id: get(build, 'id'),
        toggledTo: get(this, 'areAllSnapshotsExpanded') ? 'Open' : 'Collapsed',
      });
    },
  },
});
