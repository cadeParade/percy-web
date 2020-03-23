/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');

module.exports = function (defaults) {
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
          require('postcss-import')({path: ['node_modules']}),
          require('postcss-for'),
          require('postcss-nested'),
          require('tailwindcss')('./tailwind.config.js'),
          require('autoprefixer')({overrideBrowserslist: ['last 3 versions']}),
          require('cssnano')({
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
              },
            ],
          }),
        ],
      },
    },
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'svg'],
      prepend: '/static/',
    },
    svg: {
      paths: ['public/images/icons', 'public/images/logos', 'public/images/icons/tech'],
      optimize: {
        plugins: [{removeEmptyAttrs: false}, {cleanupIDs: {minify: false}}, {mergePaths: false}],
      },
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
    minifyCSS: {
      enabled: false,
    },
  });

  app.import('node_modules/hint.css/hint.css');
  app.import('node_modules/sinon-chai/lib/sinon-chai.js', {type: 'test'});
  app.import('node_modules/seedrandom/seedrandom.js');
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
