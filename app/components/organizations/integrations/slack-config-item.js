import Component from '@ember/component';
import {computed} from '@ember/object';
import {selectedProjectOption} from 'percy-web/components/organizations/integrations/slack-details-container'; // eslint-disable-line

export default Component.extend({
  slackIntegrationConfig: null,
  projectOptions: null,

  projectName: computed('projectOptions', 'slackIntegrationConfig.projectId', function() {
    const selectedProject = selectedProjectOption(
      this.get('projectOptions'),
      this.get('slackIntegrationConfig.projectId'),
    );
    return selectedProject && selectedProject.name;
  }),
});
