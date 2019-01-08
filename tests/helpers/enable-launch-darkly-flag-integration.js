import StubClient from 'ember-launch-darkly/test-support/helpers/launch-darkly-client-test';

// Use this in integration tests.
export default function(context, flagName) {
  context.owner.register('service:launch-darkly-client', StubClient);
  context.owner.__container__.lookup('service:launch-darkly-client').enable(flagName);
}
