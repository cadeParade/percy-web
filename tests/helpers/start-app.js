import {run} from '@ember/runloop';
import Application from '../../app';
import config from '../../config/environment';
import registerPowerSelectHelpers from 'ember-power-select/test-support/helpers';
import registerBasicDropdownHelpers from 'ember-basic-dropdown/test-support/helpers';

// This import registers Percy's async test helpers for all acceptance tests.
import './percy/register-helpers';

registerPowerSelectHelpers();
registerBasicDropdownHelpers();

export default function startApp(attrs) {
  let attributes = Object.assign({}, config.APP);
  attributes = Object.assign(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}
