import Component from '@ember/component';
import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';

export default Component.extend({
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
  // TODO(sort) fix this count
  // ex: https://percy.io/percy/percy-web/builds/4449087
  unapprovedSnapshotsWithDiffForBrowsers: alias('build.unapprovedSnapshotsWithDiffForBrowsers'),
});
