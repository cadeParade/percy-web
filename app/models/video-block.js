import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import DS from 'ember-data';
import {equal, and, notEmpty, readOnly} from '@ember/object/computed';

export default Contentful.extend({
  contentType: 'videoBlock',

  mainImage: DS.belongsTo('contentful-asset'), // model here: https://bit.ly/2MoN7fD
  imagePosition: attr(),

  header: attr(),
  subheader: attr(),

  videoEmbedUrl: attr(),
  classes: attr(),

  imageUrl: readOnly('mainImage.file.url'),
  imageDescription: readOnly('mainImage.description'),
  isImagePresent: notEmpty('imageUrl'),

  isImageCentered: equal('imagePosition', 'Center'),
  isImageLeftAligned: equal('imagePosition', 'Left'),
  isImageRightAligned: equal('imagePosition', 'Right'),

  isRightAlignedImagePresent: and('isImagePresent', 'isImageRightAligned'),
  isLeftAlignedImagePresent: and('isImagePresent', 'isImageLeftAligned'),
  isCenterAlignedImagePresent: and('isImagePresent', 'isImageCentered'),
});
