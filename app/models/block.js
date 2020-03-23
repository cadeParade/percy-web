import {computed} from '@ember/object';
import {bool} from '@ember/object/computed';
import Contentful from 'ember-data-contentful/models/contentful';

export default class Block extends Contentful {
  get contentType() {
    return 'pageBlock';
  }

  @lookupContentfulModel('id', 'content-block')
  contentBlock;

  @bool('contentBlock')
  isContentBlock;

  @lookupContentfulModel('id', 'videoBlock')
  videoBlock;

  @bool('videoBlock')
  isVideoBlock;

  @lookupContentfulModel('id', 'customer-quote-block')
  quoteBlock;

  @bool('quoteBlock')
  isQuoteBlock;

  @lookupContentfulModel('id', 'customer-logo-block')
  logoBlock;

  @bool('logoBlock')
  isLogoBlock;

  @lookupContentfulModel('id', 'footer-cta')
  footerCta;

  @bool('footerCta')
  isFooter;

  @lookupContentfulModel('id', 'hero-block')
  hero;

  @bool('hero')
  isHero;

  @lookupContentfulModel('id', 'faq-block')
  faqBlock;

  @bool('faqBlock')
  isFaqBlock;

  @lookupContentfulModel('id', 'profile-block')
  profileBlock;

  @bool('profileBlock')
  isProfileBlock;

  @lookupContentfulModel('id', 'pricing-card-block')
  pricingCardBlock;

  @bool('pricingCardBlock')
  isPricingCardBlock;

  @lookupContentfulModel('id', 'pricing-table')
  pricingTableBlock;

  @bool('pricingTableBlock')
  isPricingTableBlock;

  @lookupContentfulModel('id', 'case-study-block')
  caseStudyBlock;

  @bool('caseStudyBlock')
  isCaseStudyBlock;
}

function lookupContentfulModel(idKey, modelName) {
  return computed(idKey, function () {
    return this.store.peekRecord(modelName, this.get(idKey));
  });
}
