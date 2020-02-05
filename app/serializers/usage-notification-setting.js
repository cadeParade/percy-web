import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class UsageNotificationSetting extends JSONAPISerializer {
  normalize(modelClass, resourceHash) {
    // This model receives a nested json object from the API. The nested key (`snapshot_count`) is
    // not a top level key, and therefore originally does not go through Ember's default key
    // formatting, turning underscores/dashes into camelcase. However, once an attempt is made
    // to save the record and it errors, the nested key `snapshot_count` is mysteriously turned
    // into `snapshot-count`. This breaks bindings that read `snapshot_count` so we've made
    // the key always have a dash, so the key is always consistent.
    const counts1 = resourceHash.attributes.thresholds['snapshot_count'];
    const counts2 = resourceHash.attributes.thresholds['snapshot-count'];
    resourceHash.attributes.thresholds['snapshot-count'] = counts1 || counts2;
    delete resourceHash.attributes.thresholds['snapshot_count'];
    return super.normalize(...arguments);
  }
}
