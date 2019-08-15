import DS from 'ember-data';

export const ALL_PROJECTS_ID = 'allProjects';
export const ALL_PROJECTS_LABEL = 'All projects';
export const SLACK_NOTIFICATION_OPTIONS = [
  {
    label: 'Unreviewed',
    value: 'finished_unreviewed_snapshots',
    description:
      'Builds with visual changes to review; these notifications will auto-update if ' +
      'the builds are approved',
  },
  {
    label: 'No changes',
    value: 'finished_no_changes',
    description: 'Builds with no visual changes',
  },
  {
    label: 'Auto-approved',
    value: 'finished_auto_approved_branch',
    description: 'Builds auto-approved from your auto-approved branches',
  },
  {
    label: 'Approved',
    value: 'approved',
    description: 'Additional notifications when builds are approved',
  },
];

export default DS.Model.extend({
  slackIntegration: DS.belongsTo('slack-integration', {async: false}),
  projectId: DS.attr(),
  notificationTypes: DS.attr(),
});
