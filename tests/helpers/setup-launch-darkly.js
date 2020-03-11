import config from 'percy-web/config/environment';
import StubClient from 'ember-launch-darkly/test-support/helpers/launch-darkly-client-test';

const initialFlags = Object.assign({}, config.launchDarkly.localFeatureFlags);

export default function (hooks) {
  hooks.beforeEach(function () {
    if (!this.owner) {
      throw new Error(
        'You must call one of the ember-qunit setupTest(), setupRenderingTest() or' +
          ' setupApplicationTest() methods before calling setupLaunchDarkly()',
      );
    }

    this.owner.register('service:launch-darkly-client', StubClient);

    this.withVariation = (key, value = true) => {
      let client = this.owner.lookup('service:launch-darkly-client');
      client.setVariation(key, value);

      return value;
    };
  });

  hooks.afterEach(function () {
    let client = this.owner.lookup('service:launch-darkly-client');
    for (const flag in initialFlags) {
      client._allFlags[flag] = initialFlags[flag];
    }
    delete this.withVariation;
  });
}
