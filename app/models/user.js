import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  userHash: DS.attr(),
  name: DS.attr(),
  email: DS.attr(),
  avatarUrl: DS.attr(),
  unverifiedEmail: DS.attr(),

  userNotificationSetting: DS.belongsTo('userNotificationSetting', {async: false}),
  identities: DS.hasMany('identities', {async: false}),
  organizationUsers: DS.hasMany('organizationUser', {async: false}),

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
  organizations: DS.hasMany('organizations', {inverse: null}),

  createdAt: DS.attr('date'),
  isVerified: computed.notEmpty('email'),

  _hasIdentityType(provider) {
    return this.identities.findBy('provider', provider);
  },
});
