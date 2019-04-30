import BaseFormComponent from './base';
import {computed} from '@ember/object';
import {alias, bool, readOnly} from '@ember/object/computed';
import {ALL_PROJECTS_ID} from 'percy-web/models/slack-integration-config';
import {selectedProjectOption} from 'percy-web/components/organizations/integrations/slack-details-container'; // eslint-disable-line

const SLACK_NOTIFICATION_OPTIONS = {
  approved: 'Builds approved by anyone on the team',
  finished_unreviewed_snapshots: 'Builds that finished but need review',
  finished_no_changes: 'Builds with no visual changes',
  finished_auto_approved_branch: 'Builds auto-approved from your auto-approved branches.',
};

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
    return selectedProjectOption(this.get('projectOptions'), this.get('changeset.projectId'));
  }),

  actions: {
    selectProject(project) {
      this.get('changeset').set('projectId', project.id);
    },

    customSave() {
      const changeset = this.get('changeset');
      if (changeset.get('project.id') === ALL_PROJECTS_ID) {
        this.get('changeset').set('projectId', null);
      }
      this.send('save');
    },

    deleteSlackIntegrationConfig(slackIntegrationConfig) {
      this.get('deleteSlackIntegrationConfig')(slackIntegrationConfig);
    },
  },
});
