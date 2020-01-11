import './helpers/flash-message';

import {mocha} from 'mocha';
import Application from '../app';
import config from '../config/environment';
import {setApplication} from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';

mocha.setup({
  timeout: 10444000,
  slow: 2444000,
});

setApplication(Application.create(config.APP));
start();
