import Contentful from 'ember-data-contentful/models/contentful';
import {hasMany} from '@ember-data/model';

export default class CaseStudyBlock extends Contentful {
  get contentType() {
    return 'caseStudyBlock';
  }

  @hasMany('case-study')
  caseStudies;
}
