import DS from 'ember-data';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {typeOf} from '@ember/utils';
import Formatting from '../lib/formatting';

export default DS.Model.extend({
  organization: DS.belongsTo('organization', {async: false}),

  isEnabled: DS.attr(),
  thresholds: DS.attr(),
  emails: DS.attr(),

  // These are needed by the changeset in the form
  displayEmails: computed('emails.[]', function() {
    return returnString(this.get('emails'));
  }),
  thresholdSnapshotCount: readOnly('thresholds.snapshot-count'),
  displayThresholds: computed('thresholdSnapshotCount.[]', function() {
    return returnFormattedThresholds(this.get('thresholdSnapshotCount'));
  }),
});

function returnFormattedThresholds(input) {
  if (!input || typeOf(input) !== 'array') {
    return null;
  } else if (typeOf(input) === 'string') {
    return input.split(' ');
  }
  return input.map(num => Formatting.formatNumber(num)).join(' ');
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
