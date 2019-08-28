import Component from '@ember/component';
import {gt, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  store: service(),

  slackIntegration: null,
  deleteSlackIntegration: null,
  projectOptions: null,

  teamName: readOnly('slackIntegration.teamName'),
  channelName: readOnly('slackIntegration.channelName'),
  slackIntegrationConfigs: readOnly('slackIntegration.slackIntegrationConfigs'),

  hasConfigs: gt('slackIntegrationConfigs.length', 0),

  actions: {
    deleteSlackIntegration() {
      this.deleteSlackIntegration(this.slackIntegration);
    },
  },
});
