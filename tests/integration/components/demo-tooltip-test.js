import {setupRenderingTest} from 'ember-mocha';
import {beforeEach, it, describe} from 'mocha';
import {percySnapshot} from 'ember-percy';
import {expect} from 'chai';
import {find, waitUntil, waitFor, click, render} from '@ember/test-helpers';
import {isVisible as attacherIsVisible} from 'ember-attacher';
import {make, makeList} from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import DemoTooltip from 'percy-web/tests/pages/components/demo-tooltip';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';

describe('Integration: DemoTooltipComponent', function() {
  SetupLocalStorageSandbox();

  setupRenderingTest('demo-tooltip', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    DemoTooltip.setContext(this);
    // create a build with snapshots
    const snapshots = makeList('snapshot', 5, 'withComparisons', {fingerprint: 'fingerprint'});
    const build = make('build', 'finished', {project: {isDemo: true}});
    build.set('snapshots', snapshots);

    this.set('build', build);
  });

  describe('for a single tooltip', function() {
    beforeEach(async function() {
      localStorage.clear();
      // Choose `snapshot-overview` as it is not the first one which would show by default
      await render(hbs`
        <div style="position: absolute; top: 20px; left:20px;">
          <DemoTooltip
            @build={{build}}
            @key='snapshot-overview'
          />
          <div class="outside"></div>
        </div>
      `);
    });

    it('renders a tooltip anchor element', async function() {
      expect(DemoTooltip.isAnchorVisible).to.equal(true, 'anchor is visible');
      await percySnapshot(this.test);
    });

    it('shows the tooltip when opened', async function() {
      const tooltipElement = find('.ember-attacher');

      expect(attacherIsVisible(tooltipElement)).to.equal(false, 'tooltip should be hidden');
      await DemoTooltip.clickAnchor();

      await waitFor('.ember-attacher-show');

      expect(attacherIsVisible(tooltipElement)).to.equal(true, 'tooltip should be visible');

      // make it appear properly in Percy
      tooltipElement.style.removeProperty('transform');
      tooltipElement.style.setProperty('left', '50px');
      await percySnapshot(this.test);
    });

    it('hides the tooltip and anchor element when all are dismissed', async function() {
      const tooltipElement = find('.ember-attacher');

      await DemoTooltip.clickAnchor();
      expect(attacherIsVisible(tooltipElement)).to.equal(true, 'tooltip should be visible');
      await DemoTooltip.clickDismissAll();

      await waitUntil(() => {
        return !attacherIsVisible(tooltipElement);
      });

      expect(attacherIsVisible(tooltipElement)).to.equal(false, 'tooltip should be hidden');
      expect(DemoTooltip.isAnchorVisible).to.equal(false);
    });

    it('does not hide the anchor element when clicking outside to close', async function() {
      const tooltipElement = find('.ember-attacher');

      await DemoTooltip.clickAnchor();
      expect(attacherIsVisible(tooltipElement)).to.equal(true, 'tooltip should be visible');
      await click('.outside');

      await waitUntil(() => {
        return !attacherIsVisible(tooltipElement);
      });

      expect(attacherIsVisible(tooltipElement)).to.equal(false, 'tooltip should be hidden');
      expect(DemoTooltip.isAnchorVisible).to.equal(true);
    });
  });
});
