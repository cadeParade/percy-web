/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const nodeSass = require('node-sass');
const {join} = require('path');
const isProduction = EmberApp.env() === 'production';

const purgeCSS = {
  module: require('@fullhuman/postcss-purgecss'),
  options: {
    content: [
      // add extra paths here for components/controllers which include tailwind classes
      join(__dirname, 'app', '**', '*.html'),
      join(__dirname, 'app', '**', '*.hbs'),
    ],
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
  },
};

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
        plugins: [
          require('postcss-import'),
          require('tailwindcss')('./app/tailwind/config.js'),
          ...(isProduction ? [purgeCSS] : []),
        ],
      },
    },
    sassOptions: {
      extension: 'scss',
      sourceMapEmbed: true,
      implementation: nodeSass,
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
