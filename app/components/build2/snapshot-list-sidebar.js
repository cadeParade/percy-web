import Component from '@ember/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import localStorageProxy from 'percy-web/lib/localstorage';

export default class SnapshotListSidebar extends Component {
  @tracked isCompactSidebar = false;
  @tracked sidebarWidth = 260;

  didInsertElement() {
    if (localStorageProxy.get('sidebarWidth')) {
      var sidebarWidth = localStorageProxy.get('sidebarWidth');

      this.sidebarWidth = sidebarWidth;
      if (sidebarWidth < 220) {
        this.isCompactSidebar = true;
      }
    }
  }

  @action
  onResize(direction, {width}) {
    this.sidebarWidth = width;

    if (width < 220) {
      this.isCompactSidebar = true;
    } else {
      this.isCompactSidebar = false;
    }
  }

  @action
  onResizeStop() {
    localStorageProxy.set('sidebarWidth', this.sidebarWidth);
  }
}
