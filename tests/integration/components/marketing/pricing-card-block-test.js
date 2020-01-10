import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PricingCardBlock from 'percy-web/tests/pages/components/marketing/pricing-card-block';
import percySnapshot from '@percy/ember';
import {render} from '@ember/test-helpers';

describe('Integration: Marketing/PricingCardBlock', function() {
  setupRenderingTest('marketing/pricingCardBlock', {
    integration: true,
  });

  beforeEach(async function() {
    await render(hbs`{{marketing/pricing-card-block}}`);
  });

  it('displays correct initial values', async function() {
    expect(PricingCardBlock.slider.value).to.equal('10000');
    expect(PricingCardBlock.snapshotCount).to.equal('10,000 snapshots / month');
    expect(PricingCardBlock.calculatedPrice).to.equal('$29');
    expect(PricingCardBlock.priceText.includes('Your price')).to.equal(true);
    await percySnapshot(this.test);
  });

  it('updates values correctly', async function() {
    await PricingCardBlock.slider.setValue(80000);
    expect(PricingCardBlock.snapshotCount).to.equal('80,000 snapshots / month');
    expect(PricingCardBlock.calculatedPrice).to.equal('$349');
    expect(PricingCardBlock.priceText.includes('Your price')).to.equal(true);
    await percySnapshot(this.test);
  });
});
