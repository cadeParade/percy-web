import Controller, {inject as controller} from '@ember/controller';
import {action} from '@ember/object';
import classic from 'ember-classic-decorator';
import {readOnly} from '@ember/object/computed';

@classic
export default class SnapshotController extends Controller {
  @controller('organization/project/builds/build2')
  builds2Controller;

  @action
  toggleSnapshotListVisibility() {
    this.builds2Controller.toggleSnapshotList();
  }

  @readOnly('builds2Controller.isSnapshotListVisible')
  isSnapshotListVisible;
}
