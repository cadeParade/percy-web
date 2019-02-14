import DS from 'ember-data';
import {inject as service} from '@ember/service';

export default DS.JSONAPISerializer.extend({
  launchDarkly: service(),
  normalize(modelClass, resourceHash) {
    const isFingerprintAllowed = this.get('launchDarkly').variation('allow-snapshot-groups');
    if (isFingerprintAllowed) {
      resourceHash.attributes['gated-fingerprint'] = resourceHash.attributes.fingerprint;
    } else {
      resourceHash.attributes['gated-fingerprint'] = undefined;
    }
    delete resourceHash.attributes.fingerprint;
    return this._super(...arguments);
  },
});
