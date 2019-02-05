import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';
import {hash} from 'rsvp';

export default Route.extend({
  headTags: metaTagLookup('changelog'),
  model() {
    const hero = this.store.queryRecord('heroBlock', {
      'fields.page': 'Changelog',
    });
    const posts = this.store.findAll('changelog-post').then(posts => {
      return posts.sortBy('date').reverse();
    });

    return hash({hero, posts});
  },

  setupController(controller, model) {
    controller.setProperties({
      hero: model.hero,
      posts: model.posts,
    });
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      this.analytics.track('Changelog Page Viewed', null, {path: '/changelog'});
    },
  },
});
