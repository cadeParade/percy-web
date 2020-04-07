import Component from '@ember/component';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  launchDarkly: service(),
  attributeBindings: ['data-test-browser-switcher'],
  'data-test-browser-switcher': true,
  browsers: null,
  sortedBrowsers: computed('browsers.@each.familySlug', function () {
    const browsers = this.browsers;
    const chromeBrowser = browsers.findBy('familySlug', 'chrome');
    const notChromeBrowsers = browsers.rejectBy('familySlug', 'chrome');
    return [chromeBrowser].concat(notChromeBrowsers);
  }),

  build: null,
  updateActiveBrowser() {},

  buildSortMetadata: readOnly('build.sortMetadata'),
  unapprovedSnapshotsWithDiffForBrowsers: readOnly(
    'buildSortMetadata.unapprovedSnapshotItemsForBrowsers',
  ),
});
