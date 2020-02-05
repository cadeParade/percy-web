import config from 'percy-web/config/environment';
import RavenLogger from 'ember-cli-sentry/services/raven';

export default class RavenService extends RavenLogger {
  ignoreErrors = [ // eslint-disable-line
    'TransitionAborted',
    "'XMLHttpRequest': Failed to load 'https://events.launchdarkly.com",
  ];

  release = config.APP.VERSION;
}
