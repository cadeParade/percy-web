import {notEmpty, and, equal} from '@ember/object/computed';
import Contentful from 'ember-data-contentful/models/contentful';
import {attr, belongsTo, hasMany} from '@ember-data/model';

export default class ContentBlock extends Contentful {
  get contentType() {
    return 'contentBlock';
  }

  @attr()
  page;

  @attr()
  order;

  @belongsTo('contentful-asset')
  mainImage; // model here: https://bit.ly/2MoN7fD

  @attr()
  imagePosition;

  @attr()
  superheader;

  @attr()
  header;

  @attr()
  subheader;

  @attr()
  bodyText;

  @attr()
  bodyImages;

  @hasMany('supporting-content')
  supportingTextSections;

  @attr()
  callToActionText;

  @attr()
  callToActionLink;

  @attr()
  classes;

  @notEmpty('mainImage.file.url')
  isImagePresent;

  @equal('imagePosition', 'Center')
  isImageCentered;

  @equal('imagePosition', 'Left')
  isImageLeftAligned;

  @equal('imagePosition', 'Right')
  isImageRightAligned;

  @and('isImagePresent', 'isImageRightAligned')
  isRightAlignedImagePresent;

  @and('isImagePresent', 'isImageLeftAligned')
  isLeftAlignedImagePresent;

  @and('isImagePresent', 'isImageCentered')
  isCenterAlignedImagePresent;

  @and('callToActionText', 'callToActionLink')
  isFullCTAPresent;
}
