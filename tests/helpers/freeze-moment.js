import {beforeEach, afterEach} from 'mocha';
import moment from 'moment';

// Support for overriding the baseline time used by Moment.js. Accepts ISO formatted timestamps.
//
// Requires:
//   moment >= 2.11.0 in order to override moment.now.
// Usage:
//   describe('test', function() {
//     freezeMoment('2015-05-22');
//     freezeMoment('2014-11-04T19:00:00.000Z');
//     freezeMoment(moment('8:00 -08:00', 'H:mm a ZZ'));
//   });
export default function freezeMoment(momentObj) {
  // If given an ISO date or timestamp, create a moment object from it. Validity is checked below.
  if (typeof momentObj === 'string') {
    momentObj = moment(momentObj);
  }
  if (!momentObj || typeof momentObj !== 'object' || !momentObj.isValid()) {
    throw 'Invalid moment object given: ' + momentObj.toString();
  }

  let originalMomentNow = moment.now;

  beforeEach(function () {
    // Override the baseline time used by Moment.
    moment.now = function () {
      return momentObj.toDate();
    };
  });

  afterEach(function () {
    // Restore original moment.now method.
    moment.now = originalMomentNow;
  });
}
