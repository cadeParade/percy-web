import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class FeaturesRoute extends Route {
  @metaTagLookup('features')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'Features',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Features Viewed');
  }
}
