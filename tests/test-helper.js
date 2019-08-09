import './helpers/flash-message';

import {mocha} from 'mocha';
import loadEmberExam from 'ember-exam/test-support/load';
import Application from '../app';
import config from '../config/environment';
import {setApplication} from '@ember/test-helpers';
import {start} from 'ember-mocha';

mocha.setup({
  timeout: 10000,
  slow: 2000,
});

setApplication(Application.create(config.APP));
loadEmberExam();
start();
