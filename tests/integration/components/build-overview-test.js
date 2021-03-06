/* jshint expr:true */
import {setupRenderingTest} from 'ember-mocha';
import {beforeEach, it, describe} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';

describe('Integration: BuildOverviewComponent', function () {
  setupRenderingTest('build-overview', {
    integration: true,
  });

  beforeEach(function () {
    setupFactoryGuy(this);
  });

  const states = [
    ['pending'],
    ['processing'],
    ['finished'],
    ['finished', 'noDiffs'],
    ['failed', 'missingFinalize'],
    ['failed', 'missingResources'],
    ['failed', 'noSnapshots'],
    ['failed', 'renderTimeout'],
    ['expired'],
  ];

  states.forEach(state => {
    const testTitle = state.join(' ');

    it(`renders in state: ${testTitle}`, async function () {
      const build = make.apply(this, ['build'].concat(state));
      this.set('build', build);

      await render(hbs`<BuildOverview @build={{build}} />`);
      await percySnapshot(this.test, {darkMode: true});
    });
  });
});
