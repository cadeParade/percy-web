import Model, {attr} from '@ember-data/model';

export default Model.extend({
  url: attr(),
  width: attr('number'),
  height: attr('number'),
});
