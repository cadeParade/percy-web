import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  class: '',
  testLabel: null,
  isDisabled: false,
  isPrimaryButton: false,
  isNoShadow: false,
  isNoAnimate: false,
  bubbles: true,

  actions: {
    handleClick(e) {
      if (!this.bubbles) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Only call the action if there is one and the button is not disabled.
      if (this.handleClick && !this.isDisabled) {
        this.handleClick();
      }
    },
  },
});
