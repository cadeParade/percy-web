import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';

export default Contentful.extend({
  contentType: 'footerCta',

  largerText: attr(),
  smallerText: attr(),
  primaryButtonText: attr(),
  primaryButtonLink: attr(),
  secondaryButtonText: attr(),
  secondaryButtonLink: attr(),
});
