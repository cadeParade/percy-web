import {Factory, association} from 'ember-cli-mirage';

export default Factory.extend({
  slackIntegration: association(),
  projectId() {
    return null;
  },
  notificationTypes() {
    return ['approved', 'finished_auto_approved_branch'];
  },
});
