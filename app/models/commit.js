import {computed} from '@ember/object';
import Model, {attr} from '@ember-data/model';

export default Model.extend({
  sha: attr(),
  shaShort: computed('sha', function() {
    var sha = this.sha;
    return sha && sha.slice(0, 7);
  }),

  message: attr(),
  authorName: attr(),
});
