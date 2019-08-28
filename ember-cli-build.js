/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
    },
    'ember-cli-mocha': {
      useLintTree: false,
    },
    // see https://github.com/ember-cli/ember-cli/issues/8075 for info
    'ember-cli-uglify': {
      uglify: {
        compress: {
          collapse_vars: false,
        },
      },
    },
    postcssOptions: {
      compile: {
        extension: 'scss',
        enabled: true,
        parser: require('postcss-scss'),
        plugins: [
          require('@csstools/postcss-sass'),
          require('postcss-easy-import'),
          require('tailwindcss')('./tailwind.config.js'),
        ],
      },
    },
    autoprefixer: {
      browsers: ['last 2 versions'],
      sourcemap: true,
    },
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'svg'],
      prepend: '/static/',
    },
    svg: {
      paths: ['public/images/icons', 'public/images/logos', 'public/images/icons/tech'],
      optimize: false,
    },
    sourcemaps: {
      enabled: true,
    },
    autoImport: {
      webpack: {
        node: {
          path: true,
        },
      },
    },
  });

  app.import('bower_components/accounting.js/accounting.js');
  app.import('bower_components/highlightjs/styles/github.css');
  app.import('bower_components/highlightjs/highlight.pack.js');
  app.import('bower_components/hint.css/hint.css');
  app.import('bower_components/sinon-chai/lib/sinon-chai.js', {type: 'test'});
  app.import('bower_components/seedrandom/seedrandom.js');
  app.import('node_modules/siema/dist/siema.min.js');
  app.import('node_modules/tributejs/dist/tribute.js');
  app.import('node_modules/tributejs/dist/tribute.css');

  var extraAssets;
  if (app.env === 'development' || app.env === 'test') {
    extraAssets = new Funnel('tests/public/images/test', {
      destDir: 'images/test',
    });
  }
  return app.toTree(extraAssets);
};
