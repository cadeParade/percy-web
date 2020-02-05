import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';
import {typeOf} from '@ember/utils';
import Formatting from '../lib/formatting';

export default class UsageNotificationSetting extends Model {
  @belongsTo('organization', {async: false})
  organization;

  @attr()
  isEnabled;

  @attr()
  thresholds;

  @attr()
  emails;

  // These are needed by the changeset in the form
  @computed('emails.[]')
  get displayEmails() {
    return returnString(this.emails);
  }

  @readOnly('thresholds.snapshot-count')
  thresholdSnapshotCount;

  @computed('thresholdSnapshotCount.[]')
  get displayThresholds() {
    return returnFormattedThresholds(this.thresholdSnapshotCount);
  }
}

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
