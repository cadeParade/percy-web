import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';
import Controller from '@ember/controller';
import {set} from '@ember/object';

export default class SnapshotController extends Controller {
  @service
  store;

  queryParams = {
    currentWidth: 'width',
    comparisonMode: 'mode',
    activeBrowserFamilySlug: 'browser',
  };

  currentWidth = null;
  comparisonMode = null;
  activeBrowserFamilySlug = null;

  @computed('activeBrowserFamilySlug')
  get activeBrowser() {
    return this.store.peekAll('browser').findBy('familySlug', this.activeBrowserFamilySlug);
  }

  @computed('currentWidth')
  get snapshotSelectedWidth() {
    return this.currentWidth;
  }

  @action
  updateActiveBrowser(newBrowser) {
    set(this, 'activeBrowserFamilySlug', newBrowser.familySlug);
    this._track('Fullscreen: Browser Switched', {
      browser_id: newBrowser.get('id'),
      browser_family_slug: newBrowser.get('browserFamily.slug'),
    });
  }

  @action
  updateActiveWidth(width) {
    set(this, 'currentWidth', width);
    this._track('Fullscreen: Width Switched', {width});
  }

  @action
  updateComparisonMode(mode) {
    set(this, 'comparisonMode', mode);
    this._track('Fullscreen: Comparison Mode Switched', {mode});
  }

  _track(actionName, extraProps) {
    let build = this.build;
    const genericProps = {
      project_id: build.get('project.id'),
      project_slug: build.get('project.slug'),
      build_id: build.get('id'),
      snapshot_id: this.snapshot.id,
    };
    const organization = build.get('project.organization');

    const props = Object.assign({}, extraProps, genericProps);
    this.analytics.track(actionName, organization, props);
  }
}
