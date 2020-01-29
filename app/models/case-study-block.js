import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from '@ember-data/model';

export default Contentful.extend({
  contentType: 'caseStudyBlock',

  caseStudies: hasMany('case-study'),
});
