import Controller from '@ember/controller';
import {action} from '@ember/object';
import classic from 'ember-classic-decorator';

@classic
export default class SnapshotController extends Controller {
  @action
  toggleSnapshotListVisibility() {
    // This action is on the build2 route
    this.send('toggleSnapshotList');
  }
}
