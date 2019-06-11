import TextArea from '@ember/component/text-area';
import {EKMixin, keyDown} from 'ember-keyboard';
import {on} from '@ember/object/evented';

export default TextArea.extend(EKMixin, {
  attributeBindings: ['data-test-percy-textarea'],
  'data-test-percy-textarea': true,
  handleCmdEnter: on(keyDown('cmd+Enter'), function() {
    if (this.onCmdEnter) {
      this.onCmdEnter();
      this.element.blur();
    }
  }),

  handleEsc: on(keyDown('Escape'), function() {
    if (this.onEscape) {
      this.onEscape();
    }
    this.element.blur();
  }),
});
