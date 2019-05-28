import Component from '@ember/component';
import {alias} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  session: service(),

  currentUser: alias('session.currentUser'),
  organization: null,
  currentIntegration: alias('organization.bitbucketCloudIntegration'),
});
