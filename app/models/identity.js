import DS from 'ember-data';
import {equal} from '@ember/object/computed';

export default DS.Model.extend({
  user: DS.belongsTo('user', {async: false}),
  provider: DS.attr(),
  uid: DS.attr(),
  nickname: DS.attr(),

  isGithubIdentity: equal('provider', 'github'),
  isAuth0Identity: equal('provider', 'auth0'),
});
