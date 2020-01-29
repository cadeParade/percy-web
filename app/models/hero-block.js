import Contentful from 'ember-data-contentful/models/contentful';
import {attr, belongsTo} from '@ember-data/model';

export default Contentful.extend({
  contentType: 'heroBlock',

  page: attr(),
  superheader: attr(),
  header: attr(),
  subheadText: attr(),
  videoEmbedUrl: attr(),
  mainImage: belongsTo('contentful-asset'), // model here: https://bit.ly/2MoN7fD
  logomark: belongsTo('contentful-asset'), // model here: https://bit.ly/2MoN7fD
  classes: attr(),
});
