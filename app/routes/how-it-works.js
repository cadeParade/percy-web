import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class HowItWorksRoute extends Route {
  @metaTagLookup('howItWorks')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'HowItWorks',
    });
  }

  @action
  didTransition() {
    this.analytics.track('How It Works Viewed');
  }
}
