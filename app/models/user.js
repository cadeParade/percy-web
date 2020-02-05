import {computed} from '@ember/object';
import {notEmpty} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export default class User extends Model {
  @attr()
  userHash;

  @attr()
  name;

  @attr()
  email;

  @attr()
  avatarUrl;

  @attr()
  unverifiedEmail;

  @attr()
  webTheme;

  @belongsTo('userNotificationSetting', {async: false})
  userNotificationSetting;

  @hasMany('identities', {async: false})
  identities;

  @hasMany('organizationUser', {async: false})
  organizationUsers;

  @computed('identities.@each.provider')
  get hasGithubIdentity() {
    return this._hasIdentityType('github');
  }

  @computed('identities.@each.provider')
  get hasEmailPasswordIdentity() {
    return this.emailPasswordIdentity;
  }

  @computed('identities.@each.provider')
  get emailPasswordIdentity() {
    return this._hasIdentityType('auth0');
  }

  // These endpoints are only available on the current user and should not be accessed otherwise.
  @hasMany('organizations', {inverse: null})
  organizations;

  @attr('date')
  createdAt;

  @notEmpty('email')
  isVerified;

  _hasIdentityType(provider) {
    return this.identities.findBy('provider', provider);
  }
}
