import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Controller from '@ember/controller';
import snapshotSort from 'percy-web/lib/snapshot-sort';
import {snapshotsWithDiffForBrowser} from 'percy-web/lib/filtered-comparisons';
import {get, set, setProperties} from '@ember/object';

// NOTE: before adding something here, consider adding it to BuildContainer instead.
// This controller should only be used to maintain the state of which snapshots have been loaded.
export default class Builds2Controller extends Controller {
  // isSnapshotListVisible: true,
  // @action
  // toggleSnapshotListVisibility() {
  //   console.log('foo');
  //   this.toggleProperty('isSnapshotListVisible');
  // }
}
