import Ember from 'ember';
import Mixin from '@ember/object/mixin';
import {task, timeout} from 'ember-concurrency';
import {on} from '@ember/object/evented';

const POLLING_INTERVAL_SECONDS = 3;
const MAX_UPDATE_POLLING_REQUESTS = 2000;

// Mixin for polling in components.
// REQUIRED:
// shouldPollForUpdates property which controls whether the polling should occur and a
// pollRefresh method which will be run each time the component polls,
// OPTIONAL:
// POLLING_INTERVAL_SECONDS
// MAX_UPDATE_POLLING_REQUESTS
//
// FOR INTEGRATION TESTS:
// ====YOU MUST=== override either `pollRefresh` action OR `shouldPollForUpdates` property
// in integration tests. The `Ember.testing` check passes only for acceptance tests.
// If you do not, a random other test will fail on buildkite because the integration test
// that includes the poller will have returned a 404 not found for whatever you are polling for.
// See build-container-test for an example.

var Polling = Mixin.create({
  POLLING_INTERVAL_SECONDS,
  MAX_UPDATE_POLLING_REQUESTS,

  // set by `maybeStartPolling`
  pollingTask: null,
  // incremented by `pollForUpdatesTask`
  _numPollRequests: 0,

  maybeStartPolling: on('init', function() {
    if (this.shouldPollForUpdates) {
      this.set('pollingTask', this.pollForUpdatesTask.perform());
    }
  }),

  pollForUpdatesTask: task(function*() {
    this.set('_numPollRequests', 0);
    while (this._numPollRequests < this.MAX_UPDATE_POLLING_REQUESTS && this.shouldPollForUpdates) {
      // don't make requests when the document doesn't have focus
      // but ignore that rule if in testing, since in testing we can't guarantee window focus
      if (document.hasFocus() || Ember.testing) {
        this.incrementProperty('_numPollRequests');
        this.pollRefresh();
      }

      if (Ember.testing) {
        // Don't poll more than once if in a testing environment
        return this.pollingTask && this.pollingTask.cancel();
      }

      yield timeout(this.POLLING_INTERVAL_SECONDS * 1000);
    }
  }).drop(),
});

export default Polling;
