import {Factory, trait} from 'ember-cli-mirage';

export default Factory.extend({
  uid(i) {
    return `${i}2456`;
  },

  githubIdentity: trait({
    provider: 'github',
  }),

  auth0Identity: trait({
    provider: 'auth0',
  }),

  oktaIdentity: trait({
    provider: 'samlp',
  }),
});
