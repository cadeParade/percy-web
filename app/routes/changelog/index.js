import {action} from '@ember/object';
import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';
import {hash} from 'rsvp';

export default class IndexRoute extends Route {
  @metaTagLookup('changelog')
  headTags;

  model() {
    const hero = this.store.queryRecord('heroBlock', {
      'fields.page': 'Changelog',
    });
    const posts = this.store.findAll('changelog-post', {reload: true}).then(posts => {
      return posts.sortBy('date').reverse();
    });

    return hash({hero, posts});
  }

  setupController(controller, model) {
    controller.setProperties({
      hero: model.hero,
      posts: model.posts,
    });
  }

  @action
  didTransition() {
    this.analytics.track('Changelog Page Viewed', null, {path: '/changelog'});
  }
}
