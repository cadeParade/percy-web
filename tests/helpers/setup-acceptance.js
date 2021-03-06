import seedFaker from './seed-faker';
import {authenticateSession} from 'ember-simple-auth/test-support';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';
import {setupApplicationTest} from 'ember-mocha';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import mockStripeService from 'percy-web/tests/helpers/mock-stripe-service';

// Import mocha helpers so that they will be included for all tests.
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "it|describe" }]*/
import {describe, it, beforeEach, afterEach} from 'mocha';
import {expect} from 'chai';
import setupLaunchDarkly from 'percy-web/tests/helpers/setup-launch-darkly';

export default function setupAcceptance({authenticate = true} = {}) {
  SetupLocalStorageSandbox();
  let hooks = setupApplicationTest();
  setupMirage();
  setupLaunchDarkly(hooks);
  beforeEach(function () {
    window.localStorage.clear();
    seedFaker();
    mockStripeService(this);
    if (authenticate) {
      authenticateSession();
    }
  });

  afterEach(function () {
    if (server !== undefined) {
      server.shutdown();
    }
  });
  return hooks;
}

// setupSession sets up the session, the createData should set create mirage models.
// If there is only 1 user the this.loginUser will be set to first user.
// It there are more than one user then createData should set this.loginUser to the user who
// is to be used for authentication.
// Example:
//
// let user;
// beforeEach(function() {
//   let user = server.create('user', {name: 'Test user', id: 'test_user'});
//   let organization = server.create('organization', {name: 'Test org'});
//   server.create('organizationUser', {user: user, organization: organization});
// });
// setupSession(function() {
//   this.loginUser = user;
// });
export function setupSession(createData) {
  beforeEach(function () {
    createData.bind(this)(server);

    // If no loginUser is setup and there is only one user created, log that user in
    if (this.loginUser === undefined && server.schema.users.all().models.length === 1) {
      this.loginUser = server.schema.users.first();
    }

    // Error if no login user is specified and there is not exactly one user
    const errMsg = 'you must have one logged-in user';
    expect(this.loginUser, errMsg).not.to.be.undefined; // eslint-disable-line no-unused-expressions

    // Ensure the loginUser is logged in
    if (this.loginUser) {
      this.loginUser.update({_currentLoginInTest: true});
    }
  });

  afterEach(function () {
    if (this.loginUser) {
      this.loginUser = undefined;
    }
  });
}
