import Route from '@ember/routing/route';
import metaTagLookup from 'percy-web/lib/meta-tags';
import {hash} from 'rsvp';

export default class ShowRoute extends Route {
  @metaTagLookup('changelog')
  headTags;

  model({slug}) {
    const hero = this.store.queryRecord('heroBlock', {
      'fields.page': 'Changelog',
    });

    const post = this.store.queryRecord('changelogPost', {
      'fields.slug': slug,
    });

    return hash({
      hero,
      post,
    });
  }

  setupController(controller, model) {
    controller.setProperties({
      hero: model.hero,
      post: model.post,
    });
  }
}
