import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  actions: {
    handleClick() {
      if (this.get('handleClick')) {
        this.get('handleClick')();
      }
    },
  },
});
