import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class IntegrationsRoute extends Route {
  @metaTagLookup('integrations')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'Integrations',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Integrations Viewed');
  }
}
