import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import Component from '@ember/component';
import config from 'percy-web/config/environment';

export default Component.extend({
  store: service(),
  organization: null,
  classes: null,

  bitbucketCloudIntegrationUrl: computed('organization.slug', function () {
    const url = config.APP.bitbucketCloudUrls.integration;
    return url.replace('%@', this.get('organization.slug'));
  }),

  currentIntegration: alias('organization.bitbucketCloudIntegration'),
});
