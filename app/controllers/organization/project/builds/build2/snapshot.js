import Controller, {inject as controller} from '@ember/controller';
import {action} from '@ember/object';
import classic from 'ember-classic-decorator';

@classic
export default class SnapshotController extends Controller {
  @controller('organization/project/builds/build2')
  builds2;

  @action
  toggleSnapshotListVisibility() {
    this.builds2.toggleSnapshotList();
  }
}
