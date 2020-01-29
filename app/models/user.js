import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import {computed} from '@ember/object';

export default Model.extend({
  userHash: attr(),
  name: attr(),
  email: attr(),
  avatarUrl: attr(),
  unverifiedEmail: attr(),
  webTheme: attr(),

  userNotificationSetting: belongsTo('userNotificationSetting', {async: false}),
  identities: hasMany('identities', {async: false}),
  organizationUsers: hasMany('organizationUser', {async: false}),

  hasGithubIdentity: computed('identities.@each.provider', function() {
    return this._hasIdentityType('github');
  }),

  hasEmailPasswordIdentity: computed('identities.@each.provider', function() {
    return this.emailPasswordIdentity;
  }),

  emailPasswordIdentity: computed('identities.@each.provider', function() {
    return this._hasIdentityType('auth0');
  }),

  // These endpoints are only available on the current user and should not be accessed otherwise.
  organizations: hasMany('organizations', {inverse: null}),

  createdAt: attr('date'),
  isVerified: computed.notEmpty('email'),

  _hasIdentityType(provider) {
    return this.identities.findBy('provider', provider);
  },
});
