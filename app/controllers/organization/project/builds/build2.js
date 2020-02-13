import Controller from '@ember/controller';
import {action} from '@ember/object';
import classic from 'ember-classic-decorator';

@classic
export default class Builds2Controller extends Controller {
  isSnapshotListVisible = true;
  isSearchVisible = false;
  searchTerm = '';

  @action
  toggleSnapshotList() {
    this.toggleProperty('isSnapshotListVisible');
  }

  @action
  toggleSearchInput() {
    this.toggleProperty('isSearchVisible');
  }

  @action
  updateSearchTerm(updatedSearchTerm) {
    this.set('searchTerm', updatedSearchTerm);
  }
}
