import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {observer} from '@ember/object';

export default Component.extend({
  router: service(),

  // eslint-disable-next-line
  scrollToTop: observer('router.currentURL', 'snapshot.id', function() {
    if (this.router.currentURL.includes(this.snapshot.id)) {
      var myElement = document.getElementById(this.elementId);
      var topPos = myElement.offsetTop;
      document.getElementById('snapshot-list-sidebar').scrollTop = topPos - 320;
    }
  }),

  init() {
    this._super(...arguments);
    // Call this here so the observer can know that someone is asking
    // for currentURL
    // eslint-disable-next-line
    this.router.currentURL;
  },
});
