import Component from '@ember/component';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {ALL_PROJECTS_ID} from 'percy-web/models/slack-integration-config';

export function selectedProjectOption(projectOptions, projectId) {
  return projectOptions.find(projectOption => projectOption.id === (projectId || ALL_PROJECTS_ID));
}

export default Component.extend({
  slackIntegrationConfig: null,
  projectOptions: null,
  deleteSlackIntegrationConfig: null,

  isNew: readOnly('slackIntegrationConfig.isNew'),

  projectName: computed('projectOptions', 'slackIntegrationConfig.projectId', function() {
    const selectedProject = selectedProjectOption(
      this.get('projectOptions'),
      this.get('slackIntegrationConfig.projectId'),
    );
    return selectedProject && selectedProject.name;
  }),

  actions: {
    deleteSlackIntegrationConfig() {
      this.get('deleteSlackIntegrationConfig')(this.get('slackIntegrationConfig'));
    },
  },
});
