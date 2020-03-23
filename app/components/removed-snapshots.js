import Component from '@ember/component';
import {computed} from '@ember/object';
import {gt} from '@ember/object/computed';
import {task} from 'ember-concurrency';
import diffAttrs from 'ember-diff-attrs';

const MAX_NAMES_TO_DISPLAY = 5;

export default Component.extend({
  build: null,
  areAllRemovedSnapshotsShowing: false,
  areSnapshotsTruncated: gt('removedSnapshots.length', MAX_NAMES_TO_DISPLAY),

  snapshotsToShow: computed('removedSnapshots', 'areAllRemovedSnapshotsShowing', function () {
    if (this.areAllRemovedSnapshotsShowing) {
      return this.removedSnapshots;
    } else {
      return this.removedSnapshots.slice(0, MAX_NAMES_TO_DISPLAY);
    }
  }),

  removedSnapshotText: computed('removedSnapshots.length', function () {
    const length = this.removedSnapshots.length;
    if (length === 1) {
      return "There was 1 snapshot in the base build that isn't present in this build.";
    } else if (length > 1) {
      return `There were ${length} snapshots in the base build that aren't present in this build.`;
    } else {
      return '';
    }
  }),

  fetchRemovedSnapshots: task(function* (build) {
    const removedSnapshots = yield build.hasMany('removedSnapshots').reload();
    this.setProperties({removedSnapshots});
  }),

  didReceiveAttrs: diffAttrs('build', function (changedAttrs) {
    this._super(...arguments);

    if (changedAttrs && changedAttrs.build) {
      this.set('removedSnapshots', []);
      this.fetchRemovedSnapshots.perform(this.build);
    }
  }),

  didInsertElement() {
    this.fetchRemovedSnapshots.perform(this.build);
  },

  init() {
    this._super(...arguments);
    this.removedSnapshots = this.removedSnapshots || [];
  },
});
