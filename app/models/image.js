import DS from 'ember-data';

export default DS.Model.extend({
  url: DS.attr(),
  width: DS.attr('number'),
  height: DS.attr('number'),
});
