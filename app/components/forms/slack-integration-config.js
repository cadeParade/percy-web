import BaseFormComponent from './base';
import {computed} from '@ember/object';
import {alias, bool, readOnly} from '@ember/object/computed';
import {
  ALL_PROJECTS_ID,
  SLACK_NOTIFICATION_OPTIONS,
} from 'percy-web/models/slack-integration-config'; // eslint-disable-line
import {selectedProjectOption} from 'percy-web/components/organizations/integrations/slack-details-container'; // eslint-disable-line

export default BaseFormComponent.extend({
  model: alias('slackIntegrationConfig'),

  validator: null,
  projectOptions: null,
  slackIntegrationConfig: null,
  deleteSlackIntegrationConfig: null,
  saveSuccess: null,

  channelName: readOnly('slackIntegrationConfig.slackIntegration.channelName'),
  isEditing: bool('slackIntegrationConfig.id'),
  teamName: readOnly('slackIntegrationConfig.slackIntegration.teamName'),

  slackNotificationOptions: SLACK_NOTIFICATION_OPTIONS,
  selectedProject: computed('projectOptions', 'changeset.projectId', function() {
    return selectedProjectOption(this.projectOptions, this.get('changeset.projectId'));
  }),

  willDestroyElement() {
    // Don't leave an unsaved new project model in the store.
    this.model.rollbackAttributes();
  },

  actions: {
    selectProject(project) {
      this.changeset.set('projectId', project.id);
    },

    customSave() {
      const changeset = this.changeset;
      if (changeset.get('projectId') === ALL_PROJECTS_ID) {
        this.changeset.set('projectId', null);
      }
      this.send('save');
    },

    deleteSlackIntegrationConfig() {
      this.deleteSlackIntegrationConfig(this.slackIntegrationConfig);
    },
  },
});
