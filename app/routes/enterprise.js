import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class EnterpriseRoute extends Route {
  @metaTagLookup('enterprise')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'Enterprise',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Enterprise Viewed');
  }
}
