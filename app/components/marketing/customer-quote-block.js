import Component from '@ember/component';

export default Component.extend({
  carosel: null,
  currentSlide: 0,

  didInsertElement() {
    // Siema is imported in ember-cli-build.js
    const carosel = new Siema({ // eslint-disable-line
      loop: true,
      draggable: false,
      onChange: this._setCurrentSlide.bind(this),
    });

    this.set('carosel', carosel);
    this._autoAdvanceSlide();
  },

  actions: {
    next() {
      this.carosel.next();
      this._setCurrentSlide();
      this._clearInterval();
    },

    previous() {
      this.carosel.prev();
      this._setCurrentSlide();
      this._clearInterval();
    },

    switchToSlide(index) {
      this.carosel.goTo(index);
      this._setCurrentSlide();
      this._clearInterval();
    },
  },

  _setCurrentSlide() {
    this.set('currentSlide', this.carosel.currentSlide);
  },

  _autoAdvanceSlide() {
    const intervalId = setInterval(() => this.carosel.next(), 10000);
    this.set('intervalId', intervalId);
  },

  _clearInterval() {
    clearInterval(this.intervalId);
  },

  willDestroyElement() {
    this._clearInterval();
  },
});
