import Model, {attr, belongsTo} from '@ember-data/model';

// This model is for the join table present in the API. It is an object that represents the
// many to many relationship between project and browser_target. Ember would normally handle
// many to many relationships for us, but we need to trigger updates to this relatioship from FE,
// so we're mimicking the structure of the API join table here.
export default class ProjectBrowserTarget extends Model {
  @belongsTo('browserTarget', {async: false})
  browserTarget;

  @belongsTo('project', {async: false})
  project;

  @attr()
  isUpgradeable;

  // browserFamily relationship does not exist in the API and is therefore not populated,
  // but is used for creating new project-browser-target objects for a browser family.
  @belongsTo('browserFamily', {async: false, inverse: null})
  browserFamily;
}
