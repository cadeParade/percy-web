import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  router: service(),
  showMemberLinks: false,

  shouldShowNewProject: computed(function () {
    // hide the button if the url contains 'organizations'
    // that means we are not in the <org>/<project> namespace, we are
    // in the org settings and the 'new project' button should not show
    return !this.router.currentURL.includes('organizations') && this.showMemberLinks;
  }),
});
