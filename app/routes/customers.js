import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class CustomersRoute extends Route {
  @metaTagLookup('customers')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'Customers',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Customers Viewed');
  }
}
