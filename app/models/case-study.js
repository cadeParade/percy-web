import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import {belongsTo} from 'ember-data/relationships';

export default class CaseStudy extends Contentful {
  get contentType() {
    return 'caseStudy';
  }

  @attr()
  customerName;

  @belongsTo('contentful-asset')
  logo; // model here: https://bit.ly/2MoN7fD

  @attr()
  caseStudyTitle;

  @attr()
  industry;

  @attr()
  caseStudyLink;
}
