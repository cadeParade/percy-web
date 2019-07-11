import DS from 'ember-data';
import {singularize} from 'ember-inflector';
import normalizeModelName from 'ember-data/-private/system/normalize-model-name';

export default DS.JSONAPISerializer.extend({
  modelNameFromPayloadKey: function(key) {
    return singularize(normalizeModelName(key));
  },
});
