import {notEmpty, and, equal} from '@ember/object/computed';
import Contentful from 'ember-data-contentful/models/contentful';
import {attr, belongsTo} from '@ember-data/model';

export default class VideoBlock extends Contentful {
  get contentType() {
    return 'videoBlock';
  }

  @belongsTo('contentful-asset')
  mainImage; // model here: https://bit.ly/2MoN7fD

  @attr()
  imagePosition;

  @attr()
  header;

  @attr()
  subheader;

  @attr()
  videoEmbedUrl;

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
}
