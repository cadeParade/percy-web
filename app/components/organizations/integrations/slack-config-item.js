import Component from '@ember/component';
import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import {selectedProjectOption} from 'percy-web/components/organizations/integrations/slack-details-container'; // eslint-disable-line
import {SLACK_NOTIFICATION_OPTIONS} from 'percy-web/models/slack-integration-config';

export default Component.extend({
  slackIntegrationConfig: null,
  projectOptions: null,

  branch: alias('slackIntegrationConfig.branch'),
  notificationTypes: alias('slackIntegrationConfig.notificationTypes'),
  notificationLabels: computed('notificationTypes', function () {
    return this.notificationTypes.map(function (setting) {
      return SLACK_NOTIFICATION_OPTIONS.findBy('value', setting).label;
    });
  }),
  projectName: computed('projectOptions', 'slackIntegrationConfig.projectId', function () {
    const selectedProject = selectedProjectOption(
      this.projectOptions,
      this.get('slackIntegrationConfig.projectId'),
    );
    return selectedProject && selectedProject.name;
  }),
});
