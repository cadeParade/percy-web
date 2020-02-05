import Contentful from 'ember-data-contentful/models/contentful';
import {attr, belongsTo} from '@ember-data/model';

export default class HeroBlock extends Contentful {
  get contentType() {
    return 'heroBlock';
  }

  @attr()
  page;

  @attr()
  superheader;

  @attr()
  header;

  @attr()
  subheadText;

  @attr()
  videoEmbedUrl;

  @belongsTo('contentful-asset')
  mainImage; // model here: https://bit.ly/2MoN7fD

  @belongsTo('contentful-asset')
  logomark; // model here: https://bit.ly/2MoN7fD

  @attr()
  classes;
}
