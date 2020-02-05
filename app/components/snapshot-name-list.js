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
        return this.caseInsensitiveIncludes(snapshot.name, this.searchTerm);
      });
    }
  }),

  caseInsensitiveIncludes(string, substring) {
    const regex = new RegExp(substring, 'i');
    return regex.test(string);
  },

  actions: {
    updateSearchTerm(updatedSearchTerm) {
      this.set('searchTerm', updatedSearchTerm);
    },
  },
});
