import {setupRenderingTest} from 'ember-mocha';
import {beforeEach, it, describe} from 'mocha';
import {percySnapshot} from 'ember-percy';
import {expect} from 'chai';
import {find, waitUntil, waitFor, click} from '@ember/test-helpers';
import {isVisible as attacherIsVisible} from 'ember-attacher';

import hbs from 'htmlbars-inline-precompile';
import DemoTooltip from 'percy-web/tests/pages/components/demo-tooltip';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';

describe('Integration: DemoTooltipComponent', function() {
  SetupLocalStorageSandbox();

  setupRenderingTest('demo-tooltip', {
    integration: true,
  });

  beforeEach(function() {
    DemoTooltip.setContext(this);
  });

  describe('for a single tooltip', function() {
    beforeEach(async function() {
      localStorage.clear();
      await this.render(hbs`
        <div style="position: absolute; top: 20px; left:20px;">
          {{demo-tooltip
            shouldShowTip=true
            key='test-one'
            title='Important Tip'
            message='Never get involved in a land war in Asia'
          }}
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

    it('hides the tooltip and anchor element when dismissed', async function() {
      const tooltipElement = find('.ember-attacher');

      await DemoTooltip.clickAnchor();
      expect(attacherIsVisible(tooltipElement)).to.equal(true, 'tooltip should be visible');
      await DemoTooltip.clickDismiss();

      await waitUntil(() => {
        return !attacherIsVisible(tooltipElement);
      });

      expect(attacherIsVisible(tooltipElement)).to.equal(false, 'tooltip should be hidden');
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
