import Contentful from 'ember-data-contentful/models/contentful';
import {attr, belongsTo, hasMany} from '@ember-data/model';
import {equal, and, notEmpty} from '@ember/object/computed';

export default Contentful.extend({
  contentType: 'contentBlock',

  page: attr(),
  order: attr(),
  mainImage: belongsTo('contentful-asset'), // model here: https://bit.ly/2MoN7fD
  imagePosition: attr(),
  superheader: attr(),
  header: attr(),
  subheader: attr(),
  bodyText: attr(),
  bodyImages: attr(),
  supportingTextSections: hasMany('supporting-content'),
  callToActionText: attr(),
  callToActionLink: attr(),
  classes: attr(),

  isImagePresent: notEmpty('mainImage.file.url'),

  isImageCentered: equal('imagePosition', 'Center'),
  isImageLeftAligned: equal('imagePosition', 'Left'),
  isImageRightAligned: equal('imagePosition', 'Right'),

  isRightAlignedImagePresent: and('isImagePresent', 'isImageRightAligned'),
  isLeftAlignedImagePresent: and('isImagePresent', 'isImageLeftAligned'),
  isCenterAlignedImagePresent: and('isImagePresent', 'isImageCentered'),

  isFullCTAPresent: and('callToActionText', 'callToActionLink'),
});
