import Component from '@ember/component';
import {gt, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {ALL_PROJECTS_ID, ALL_PROJECTS_LABEL} from 'percy-web/models/slack-integration-config';

export default Component.extend({
  store: service(),

  newConfig: null,
  slackIntegration: null,
  deleteSlackIntegration: null,
  createNewIntegrationConfig: null,
  deleteSlackIntegrationConfig: null,

  teamName: readOnly('slackIntegration.teamName'),
  channelName: readOnly('slackIntegration.channelName'),
  slackIntegrationConfigs: readOnly('slackIntegration.slackIntegrationConfigs'),
  projects: readOnly('slackIntegration.organization.projects'),

  hasConfigs: gt('slackIntegrationConfigs.length', 0),
  projectOptions: computed('projects.@each.{id,name}', function() {
    let orgProjects = this.get('projects').map(project => {
      return {id: Number(project.get('id')), name: project.get('name')};
    });
    return [{id: ALL_PROJECTS_ID, name: ALL_PROJECTS_LABEL}].concat(orgProjects);
  }),

  actions: {
    createNewIntegrationConfig() {
      this.get('createNewIntegrationConfig')(this.get('slackIntegration'));
    },

    deleteSlackIntegration() {
      this.get('deleteSlackIntegration')(this.get('slackIntegration'));
    },
  },
});
