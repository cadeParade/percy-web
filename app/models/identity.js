import {computed} from '@ember/object';
import {equal} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export const SELF_MANAGED_IDENTITY_PROVIDERS = ['github', 'auth0'];

export default class Identity extends Model {
  @belongsTo('user', {async: false})
  user;

  @attr()
  provider;

  @attr()
  uid;

  @attr()
  nickname;

  @equal('provider', 'github')
  isGithubIdentity;

  @equal('provider', 'auth0')
  isAuth0Identity;

  @computed('provider')
  get isSamlIdentity() {
    return this.provider.includes('samlp|');
  }

  @computed('provider')
  get isOktaIdentity() {
    return this.provider.includes('okta');
  }

  @computed
  get isExternallyManaged() {
    return !SELF_MANAGED_IDENTITY_PROVIDERS.includes(this.provider);
  }
}
