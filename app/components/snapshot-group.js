import Component from '@ember/component';
import {computed, get, set} from '@ember/object';
import {filterBy, or, readOnly} from '@ember/object/computed';
import filteredComparisons from 'percy-web/lib/filtered-comparisons';

export default Component.extend({
  snapshots: null,
  activeBrowser: null,
  userSelectedWidth: null,

  isGroupExpanded: false,

  attributeBindings: ['data-test-snapshot-group'],
  'data-test-snapshot-group': true,

  coverSnapshot: readOnly('snapshots.firstObject'),
  approvableSnapshots: filterBy('snapshots', 'isUnreviewed'),
  groupSelectedWidth: or('userSelectedWidth', 'filteredComparisons.defaultWidth'),
  _unapprovedSnapshots: filterBy('snapshots', 'isUnreviewed'),
  numUnapprovedSnapshots: readOnly('_unapprovedSnapshots.length'),

  isGroupApproved: computed('snapshots.@each.isApproved', function() {
    return get(this, 'snapshots').every(snapshot => {
      return snapshot.get('isApproved');
    });
  }),

  filteredComparisons: computed('coverSnapshot', 'activeBrowser', 'groupSelectedWidth', function() {
    return filteredComparisons.create({
      snapshot: get(this, 'coverSnapshot'),
      activeBrowser: get(this, 'activeBrowser'),
      snapshotSelectedWidth: get(this, 'userSelectedWidth'),
    });
  }),

  actions: {
    updateSelectedWidth(value) {
      set(this, 'userSelectedWidth', value);
    },
  },
});
