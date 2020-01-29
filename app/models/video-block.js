import Contentful from 'ember-data-contentful/models/contentful';
import {attr, belongsTo} from '@ember-data/model';
import {equal, and, notEmpty} from '@ember/object/computed';

export default Contentful.extend({
  contentType: 'videoBlock',

  mainImage: belongsTo('contentful-asset'), // model here: https://bit.ly/2MoN7fD
  imagePosition: attr(),

  header: attr(),
  subheader: attr(),

  videoEmbedUrl: attr(),
  classes: attr(),

  isImagePresent: notEmpty('mainImage.file.url'),

  isImageCentered: equal('imagePosition', 'Center'),
  isImageLeftAligned: equal('imagePosition', 'Left'),
  isImageRightAligned: equal('imagePosition', 'Right'),

  isRightAlignedImagePresent: and('isImagePresent', 'isImageRightAligned'),
  isLeftAlignedImagePresent: and('isImagePresent', 'isImageLeftAligned'),
  isCenterAlignedImagePresent: and('isImagePresent', 'isImageCentered'),
});
