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

  unapprovedSnapshotsWithDiffForBrowsers: computed(
    'build.{unapprovedSnapshotsWithDiffForBrowsers,unapprovedSnapshotsCountForBrowsers}',
    function () {
      if (this.launchDarkly.variation('snapshot-sort-api')) {
        return this.build.unapprovedSnapshotsCountForBrowsers;
      } else {
        return this.build.unapprovedSnapshotsWithDiffForBrowsers;
      }
    },
  ),
});
