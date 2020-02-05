import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class VisualTestingRoute extends Route {
  @metaTagLookup('visualTesting')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'VisualTesting',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Visual Testing Viewed');
  }
}
