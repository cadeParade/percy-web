import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class PricingRoute extends Route {
  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'Pricing-v2',
    });
  }

  @metaTagLookup('pricing')
  headTags;

  @action
  didTransition() {
    this.analytics.track('Pricing Viewed');
  }
}
