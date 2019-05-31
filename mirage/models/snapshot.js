// TODO: Would like to remove this.  Haven't yet, due to what I suspect is a bug in mirage.
// Mirage doesn't seem to prevent infinite loops when resolving foreign keys when
// using the real model rather than the mirage model.

import {Model, belongsTo, hasMany} from 'ember-cli-mirage';

export default Model.extend({
  build: belongsTo('build'),
  screenshots: hasMany('screenshot'),
  comparisons: hasMany('comparison'),
  commentThreads: hasMany('commentThread'),
});
