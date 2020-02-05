import JSONAPISerializer from '@ember-data/serializer/json-api';
import {singularize} from 'ember-inflector';
import {normalizeModelName} from '@ember-data/store';

export default class Comments extends JSONAPISerializer {
  modelNameFromPayloadKey(key) {
    return singularize(normalizeModelName(key));
  }
}
