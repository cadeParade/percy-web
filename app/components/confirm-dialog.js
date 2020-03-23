import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';

export default Component.extend(EKMixin, {
  confirm: service(),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
  },

  onEnterDown: on(keyDown('Enter'), function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.confirm.confirm();
  }),
  onEscDown: on(keyDown('Escape'), function () {
    this.confirm.cancel();
  }),
});
