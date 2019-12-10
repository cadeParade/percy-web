import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  intercom: service(),

  queryParams: ['noBuilds'],

  actions: {
    updateIntercom() {
      if (this.noBuilds) {
        this.intercom.update();
      }
    },
  },
});
