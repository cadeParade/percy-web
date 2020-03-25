import Component from '@ember/component';
import {computed} from '@ember/object';
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
  // TODO(sort) fix this count
  // ex: https://percy.io/percy/percy-web/builds/4449087
  unapprovedSnapshotsWithDiffForBrowsers: computed(
    'build.{unapprovedSnapshotsWithDiffForBrowsers,unapprovedSnapshotsForBrowsersCount}',
    function () {
      if (this.launchDarkly.variation('snapshot-sort-api')) {
        return this.build.unapprovedSnapshotsForBrowsersCount;
      } else {
        return this.build.unapprovedSnapshotsWithDiffForBrowsers;
      }
    },
  ),
});
