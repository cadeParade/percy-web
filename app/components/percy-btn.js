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
      if (this.get('handleClick')) {
        this.get('handleClick')();
      }
    },
  },
});
