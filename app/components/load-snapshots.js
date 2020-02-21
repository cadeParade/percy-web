import Component from '@ember/component';
import {or, alias, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {task} from 'ember-concurrency';
import metadataSort from 'percy-web/lib/metadata-sort';
import diffAttrs from 'ember-diff-attrs';

export default Component.extend({
  tagName: '',
  store: service(),
  limit: 2,

  // page 0, limit 2 -- offset 0, end is 2
  // page 1, limit 2 -- offset 2, end is 4
  // page 2, limit 2 -- offset 4, end is 6
  // page 3, limit 2 -- offset 6, end is 8

  orderItems: metadataSort,

  didInsertElement() {
    this._super(...arguments);

    this.query.perform();
  },

  didReceiveAttrs: diffAttrs('page', 'limit', function(changedAttrs) {
    this._super(...arguments);

    if (changedAttrs && (changedAttrs.page || changedAttrs.limit) ) {
      this.query.perform();
    }
  }),

  query: task(function*() {
    const offset = this.page * this.limit;
    const endIndex = (this.page + 1) * this.limit
    return this.orderItems.items.slice(offset, endIndex);
  })

});
