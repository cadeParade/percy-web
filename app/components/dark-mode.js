import Component from '@ember/component';
import {inject} from '@ember/service';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  router: inject(),
  session: inject(),
  currentUser: readOnly('session.currentUser'),
  bodyClass: computed('currentUser.webTheme', 'router.currentRouteName', function () {
    if (!this.currentUser) {
      return;
    }

    let theme = this.currentUser.webTheme;
    let bodyClass = '';

    if (this.router.currentRouteName.includes('organization.project.builds.build')) {
      if (
        theme === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        bodyClass = 'theme-dark';
      } else {
        bodyClass = `theme-${theme}`;
      }
    }

    return bodyClass;
  }),
});
