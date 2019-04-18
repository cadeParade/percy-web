import Component from '@ember/component';
import AdminMode from 'percy-web/lib/admin-mode';

export default Component.extend({
  isAdminEnabled: false,

  init() {
    this._super(...arguments);

    this.set('isAdminEnabled', AdminMode.isAdmin());
  },

  actions: {
    toggleAdmin() {
      this.toggleProperty('isAdminEnabled');

      if (this.get('isAdminEnabled')) {
        AdminMode.setAdminMode();
      } else {
        AdminMode.clear();
      }
    },
  },
});
