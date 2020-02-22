import Component from '@ember/component';
import {or, alias, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';

export default Component.extend({
  page: 0,

  numSnapshotsChanged: readOnly('orderItems.items.length'),
  numSnapshotsUnchanged: computed('build.totalSnapshots', 'numSnapshotsChanged', function() {
    return this.build.totalSnapshots - this.numSnapshotsChanged;
  }),

  actions: {
    noop() {},
  }
});
