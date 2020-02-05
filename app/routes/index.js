import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class IndexRoute extends Route {
  @metaTagLookup('root')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'Home',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Home Viewed');
  }
}
