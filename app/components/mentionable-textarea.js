import Component from '@ember/component';
import {computed} from '@ember/object';
import {get} from '@ember/object';
import {inject as service} from '@ember/service';
import Ember from 'ember';

// This file relies heavily on the tributejs api.
// Docs for which can be found here: perhaps a link to https://github.com/zurb/tribute#a-collection
export default Component.extend({
  store: service(),
  'data-test-mentionable-textarea': true,

  tributeConfigs: null,
  handleItemSelected: null,

  textareaElement: computed(function() {
    return this.element.querySelector('textarea');
  }),

  _handleItemSelected(e) {
    const item = parseSelectEvent(e);
    this.handleItemSelected(item);
  },

  init() {
    this._super(...arguments);
    // "pre"-bind this method to the component context so we can add/remove event listeners
    // with exactly identical functions.
    this.set('boundHandleItemSelected', this._handleItemSelected.bind(this));
    this.tributeConfigs = this.tributeConfigs || [];
    this.handleItemSelected = this.handleItemSelected || function() {};
  },

  didInsertElement() {
    this._super(...arguments);
    const tribute = initializeTribute(this.tributeConfigs);
    tribute.attach(this.textareaElement);
    this.setProperties({tribute});
    this.textareaElement.addEventListener('tribute-replaced', this.boundHandleItemSelected);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.textareaElement.removeEventListener('tribute-replaced', this.boundHandleItemSelected);
    this.tribute.hideMenu();
    this.tribute.detach(this.textareaElement);
  },
});

function parseSelectEvent(e) {
  // use `get` so it safely looks it up even if those keys somehow aren't found.
  return get(e, 'detail.item.original');
}

function initializeTribute(configs) {
  const menuContainer = Ember.testing ? document.getElementById('ember-testing') : document.body;

  // Tribute is imported in ember-cli-build.js
  // eslint-disable-next-line
  return new Tribute({
    menuContainer,
    collection: configs,
  });
}
