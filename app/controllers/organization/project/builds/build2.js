import Controller from '@ember/controller';
import {action} from '@ember/object';
import classic from 'ember-classic-decorator';

@classic
export default class Builds2Controller extends Controller {
  isSnapshotListVisible = true;

  @action
  toggleSnapshotList() {
    this.toggleProperty('isSnapshotListVisible');
  }
}
