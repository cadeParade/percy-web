import Model, {attr, belongsTo} from '@ember-data/model';

// This model is for the join table present in the API. It is an object that represents the
// many to many relationship between project and browser_target. Ember would normally handle
// many to many relationships for us, but we need to trigger updates to this relatioship from FE,
// so we're mimicking the structure of the API join table here.
export default Model.extend({
  browserTarget: belongsTo('browserTarget', {async: false}),
  project: belongsTo('project', {async: false}),
  isUpgradeable: attr(),

  // browserFamily relationship does not exist in the API and is therefore not populated,
  // but is used for creating new project-browser-target objects for a browser family.
  browserFamily: belongsTo('browserFamily', {async: false, inverse: null}),
});
