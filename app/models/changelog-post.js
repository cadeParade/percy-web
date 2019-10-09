import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo} from 'ember-data/relationships';

export default Contentful.extend({
  contentType: 'changelogPost',

  title: attr('string'),
  slug: attr('string'),
  date: attr('date'),
  tag: attr('string'),
  image: belongsTo('contentful-asset'), // model here: https://bit.ly/2MoN7fD
  content: attr('string'),
});
