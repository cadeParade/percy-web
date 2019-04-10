import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  store: service(),

  connectSlackChannel: null,
  deleteSlackIntegration: null,
  createNewIntegrationConfig: null,
  deleteSlackIntegrationConfig: null,

  actions: {
    connectSlackChannel() {
      this.get('connectSlackChannel')();
    },
  },
});
