import Model, {attr, belongsTo} from '@ember-data/model';
import {equal} from '@ember/object/computed';

export default Model.extend({
  organization: belongsTo('organization', {async: false}),
  provider: attr('string'),
  auth0ConnectionName: attr('string'),
  providerLoginUrl: attr('string'),
  emailDomain: attr('string'),
  forceSso: attr('boolean'),

  isOktaIntegration: equal('provider', 'okta'),
});
