import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';

export default class FooterCta extends Contentful {
  get contentType() {
    return 'footerCta';
  }

  @attr()
  largerText;

  @attr()
  smallerText;

  @attr()
  primaryButtonText;

  @attr()
  primaryButtonLink;

  @attr()
  secondaryButtonText;

  @attr()
  secondaryButtonLink;
}
