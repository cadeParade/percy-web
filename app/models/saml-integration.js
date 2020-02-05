import {equal} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export default class SamlIntegration extends Model {
  @belongsTo('organization', {async: false})
  organization;

  @attr('string')
  provider;

  @attr('string')
  auth0ConnectionName;

  @attr('string')
  providerLoginUrl;

  @attr('string')
  emailDomain;

  @attr('boolean')
  forceSso;

  @equal('provider', 'okta')
  isOktaIntegration;
}
