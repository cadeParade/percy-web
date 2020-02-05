import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';

export default class ScheduleDemoRoute extends Route {
  @metaTagLookup('scheduleDemo')
  headTags;

  model() {
    return this.store.queryRecord('marketing-page', {
      'fields.pageName': 'ScheduleDemo',
    });
  }

  @action
  didTransition() {
    this.analytics.track('Schedule Demo Viewed');
  }
}
