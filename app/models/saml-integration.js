import DS from 'ember-data';
import {equal} from '@ember/object/computed';

export default DS.Model.extend({
  organization: DS.belongsTo('organization', {async: false}),
  provider: DS.attr('string'),
  auth0ConnectionName: DS.attr('string'),
  providerLoginUrl: DS.attr('string'),
  emailDomain: DS.attr('string'),

  isOktaIntegration: equal('provider', 'okta'),
});
