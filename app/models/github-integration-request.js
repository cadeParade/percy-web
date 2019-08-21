import DS from 'ember-data';
import {computed} from '@ember/object';
import config from 'percy-web/config/environment';

const GITHUB_SETUP_URL = config.APP.githubUrls.integration;

export default DS.Model.extend({
  state: DS.attr(),
  stateParam: DS.attr(),
  createdBy: DS.belongsTo('user', {async: false}),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  setupUrl: computed('stateParam', function() {
    return `${GITHUB_SETUP_URL}?state=${this.stateParam}`;
  }),
});
