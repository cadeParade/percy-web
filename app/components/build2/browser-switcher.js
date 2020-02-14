import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  sortedBrowsers: computed('browsers.@each.familySlug', function() {
    const browsers = this.browsers;
    const chromeBrowser = browsers.findBy('familySlug', 'chrome');
    const notChromeBrowsers = browsers.rejectBy('familySlug', 'chrome');
    return [chromeBrowser].concat(notChromeBrowsers);
  }),
});
