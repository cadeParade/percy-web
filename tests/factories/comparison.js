import FactoryGuy from 'ember-data-factory-guy';

export const TEST_COMPARISON_WIDTHS = [375, 550, 1024];

FactoryGuy.define('comparison', {
  default: {
    diffRatio: 0.23,
    browser: () => {
      return FactoryGuy.make('browser');
    },

    headScreenshot: f => {
      // TODO: make the screenshot and image a real FactoryGuy model instead of POJO
      return {
        id: f.id,
        image: {id: f.id, url: '/images/test/v2.png', width: 375, height: 500},
        lossyImage: {id: f.id, url: '/images/test/v2-lossy.png', width: 375, height: 500},
      };
    },
    baseScreenshot: f => {
      // TODO: make the screenshot and image a real FactoryGuy model instead of POJO
      return {
        id: f.id,
        image: {id: f.id, url: '/images/test/v1.png', width: 375, height: 500},
        lossyImage: {id: f.id, url: '/images/test/v1-lossy.png', width: 375, height: 500},
      };
    },
    diffImage: f => {
      // TODO: make the screenshot and image a real FactoryGuy model instead of POJO
      return {id: f.id, image: {id: f.id, url: '/images/test/diff.png', width: 375, height: 500}};
    },
  },

  traits: {
    new: {
      baseScreenshot: null,
    },

    forChrome: {
      browser: () => {
        return FactoryGuy.make('browser', 'chrome');
      },
      headScreenshot: f => {
        // TODO: make the screenshot and image a real FactoryGuy model instead of POJO
        return {
          id: f.id,
          image: {id: f.id, url: '/images/test/v2-chrome.png', width: 375, height: 500},
          lossyImage: {id: f.id, url: '/images/test/v2-lossy-chrome.png', width: 375, height: 500},
        };
      },
      baseScreenshot: f => {
        // TODO: make the screenshot and image a real FactoryGuy model instead of POJO
        return {
          id: f.id,
          image: {id: f.id, url: '/images/test/v1-chrome.png', width: 375, height: 500},
          lossyImage: {id: f.id, url: '/images/test/v1-lossy-chrome.png', width: 375, height: 500},
        };
      },
      diffImage: f => {
        // TODO: make the screenshot and image a real FactoryGuy model instead of POJO
        return {id: f.id, image: {id: f.id, url: '/images/test/diff.png', width: 375, height: 500}};
      },
    },
  },
});
