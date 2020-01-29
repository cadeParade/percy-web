import Model, {attr, belongsTo} from '@ember-data/model';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {typeOf} from '@ember/utils';
import Formatting from '../lib/formatting';

export default Model.extend({
  organization: belongsTo('organization', {async: false}),

  isEnabled: attr(),
  thresholds: attr(),
  emails: attr(),

  // These are needed by the changeset in the form
  displayEmails: computed('emails.[]', function() {
    return returnString(this.emails);
  }),
  thresholdSnapshotCount: readOnly('thresholds.snapshot-count'),
  displayThresholds: computed('thresholdSnapshotCount.[]', function() {
    return returnFormattedThresholds(this.thresholdSnapshotCount);
  }),
});

export function returnFormattedThresholds(input) {
  let thresholds;
  if (!input) {
    return null;
  } else if (typeOf(input) === 'string') {
    thresholds = input.split(' ');
  } else if (typeOf(input) === 'array') {
    thresholds = input;
  }
  return thresholds.map(num => Formatting.formatNumber(num)).join(' ');
}

function returnString(input) {
  if (!input) {
    return null;
  } else if (typeOf(input) === 'string') {
    return input;
  } else if (typeOf(input) === 'array') {
    return input.join(' ');
  }
}
