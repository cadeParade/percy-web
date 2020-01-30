import {computed} from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  snapshots: null,
  searchTerm: '',

  filteredSnapshots: computed('searchTerm', function() {
    if (this.searchTerm === '') {
      return this.snapshots;
    } else {
      return this.snapshots.filter(snapshot => {
        return snapshot.name.includes(this.searchTerm);
      });
    }
  }),

  actions: {
    updateSearchTerm(updatedSearchTerm) {
      this.set('searchTerm', updatedSearchTerm);
    },
  },
});
