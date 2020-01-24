import {filterBy, notEmpty, or, readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  snapshots: null,
  searchTerm: '',

  actions: {
    updateSearchTerm(updatedSearchTerm) {
      console.log('search term??', this.searchTerm);
      this.set('searchTerm', updatedSearchTerm);

      if (this.searchTerm === '' || updatedSearchTerm === '') {
        this.set('filteredSnapshots', this.snapshots);
      } else {
        const filteredSnapshots = this.snapshots.filter(snapshot => {
          return snapshot.name.includes(updatedSearchTerm);
        });
        this.set('filteredSnapshots', filteredSnapshots);
      }
    },
  },
});
