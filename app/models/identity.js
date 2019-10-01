import DS from 'ember-data';
import {equal} from '@ember/object/computed';
import {computed} from '@ember/object';

export const SELF_MANAGED_IDENTITY_PROVIDERS = ['github', 'auth0'];

export default DS.Model.extend({
  user: DS.belongsTo('user', {async: false}),
  provider: DS.attr(),
  uid: DS.attr(),
  nickname: DS.attr(),

  isGithubIdentity: equal('provider', 'github'),
  isAuth0Identity: equal('provider', 'auth0'),
  isSamlIdentity: computed('provider', function() {
    return this.provider.includes('samlp|');
  }),
  isOktaIdentity: computed('provider', function() {
    return this.provider.includes('okta');
  }),

  isExternallyManaged: computed(function() {
    return !SELF_MANAGED_IDENTITY_PROVIDERS.includes(this.provider);
  }),
});
