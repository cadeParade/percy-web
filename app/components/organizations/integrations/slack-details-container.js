import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {ALL_PROJECTS_ID, ALL_PROJECTS_LABEL} from 'percy-web/models/slack-integration-config';

const ALL_PROJECTS_OPTION = {id: ALL_PROJECTS_ID, name: ALL_PROJECTS_LABEL};

// This function is used by both the downstream components that rely on projectOptions
export function selectedProjectOption(projectOptions, projectId) {
  return (
    projectOptions.find(projectOption => projectOption.id === Number(projectId)) ||
    ALL_PROJECTS_OPTION
  );
}

export default Component.extend({
  store: service(),
  session: service(),
  router: service(),

  // The purpose of this component is to fetch projects and pass down projectOptions
  organization: null,

  // For displaying organizations/integrations/slack-settings
  showSlackIntegrationList: null,
  connectSlackChannel: null,
  deleteSlackIntegration: null,

  // For displaying forms/slack-integration-config
  showSlackIntegrationConfig: null,
  deleteSlackIntegrationConfig: null,

  init() {
    this._super(...arguments);
    this._getOrganizationProjects.perform();
  },

  fetchedProjects: null,
  _getOrganizationProjects: task(function* () {
    const fetchedProjects = yield this.store.query('project', {
      organization: this.organization,
    });
    this.setProperties({fetchedProjects});
  }),
  projectOptions: computed('fetchedProjects.@each.{id,name}', function () {
    let orgProjects = this.fetchedProjects.map(project => {
      return {id: Number(project.get('id')), name: project.get('name')};
    });
    return [ALL_PROJECTS_OPTION].concat(orgProjects);
  }),

  actions: {
    slackConfigSaveSuccess() {
      this.flashMessages.success('Your Slack setting has been saved.');
      this.router.transitionTo(
        'organizations.organization.integrations.slack',
        this.get('slackIntegrationConfig.slackIntegration.organization.slug'),
      );
    },
  },
});
