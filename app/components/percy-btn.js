import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  class: '',
  testLabel: null,
  isDisabled: false,
  isPrimaryButton: false,
  isNoShadow: false,
  isNoAnimate: false,

  actions: {
    handleClick() {
      // Only call the action if there is one and the button is not disabled.
      if (this.handleClick && !this.isDisabled) {
        this.handleClick();
      }
    },
  },
});
