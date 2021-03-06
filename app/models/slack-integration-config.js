import Model, {attr, belongsTo} from '@ember-data/model';

export const ALL_PROJECTS_ID = 'allProjects';
export const ALL_PROJECTS_LABEL = 'All projects';
export const SLACK_NOTIFICATION_OPTIONS = [
  {
    label: 'Unreviewed & Changes requested',
    value: 'finished_unreviewed_snapshots',
    description:
      'Builds with visual changes or changes requested; these notifications will auto-update if ' +
      'the build status changes.',
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

export default class SlackIntegrationConfig extends Model {
  @belongsTo('slack-integration', {async: false})
  slackIntegration;

  @attr()
  projectId;

  @attr()
  notificationTypes;
}
