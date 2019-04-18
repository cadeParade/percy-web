import Component from '@ember/component';

export default Component.extend({
  lang: null,

  classNames: ['CodeBlock'],
  didInsertElement() {
    this.$('pre code').each(function(i, block) {
      window.hljs.highlightBlock(block);
    });
  },
});
