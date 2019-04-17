import {it, describe, beforeEach} from 'mocha';
import {percySnapshot} from 'ember-percy';
import {make} from 'ember-data-factory-guy';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import NoticeBar from 'percy-web/tests/pages/components/notice-bar';

describe('Integration: Notice Bar', function() {
  setupRenderingTest('notice-bar', {
    integration: true,
  });

  let organization;

  beforeEach(function() {
    setupFactoryGuy(this);
    NoticeBar.setContext(this);
  });

  describe('New project prompt bar', function() {
    beforeEach(async function() {
      organization = make('organization');
      organization.set('_filteredOrganizationUsers', [make('user')]);
      this.setProperties({
        organization,
      });
    });

    it('shows new project prompt', async function() {
      await this.render(hbs`{{notice-bar
        organization=organization
        shouldShowNewProjectPrompt=true
      }}`);

      expect(NoticeBar.message.text).to.equal('Get started with your own project.');
      expect(NoticeBar.buttonLink.text).to.equal('Create project');
      await percySnapshot(this.test);
    });
  });

  describe('Free Usage Bar', function() {
    beforeEach(function() {
      organization = make('organization', 'withFreePlan');
      organization.set('_filteredOrganizationUsers', [make('user')]);
      this.setProperties({
        organization,
      });
    });

    describe('when <1% of snapshots have been used', function() {
      beforeEach(function() {
        organization.subscription.set('currentUsageRatio', '0.00001');
      });

      it('shows 1% and "More Info" link', async function() {
        await this.render(hbs`{{notice-bar organization=organization}}`);
        expect(NoticeBar.percentage.text).to.equal('1%');
        expect(NoticeBar.buttonLink.text).to.equal('More Info');

        await percySnapshot(this.test);
      });
    });

    describe('when 99.9% of snapshots have been used', function() {
      beforeEach(function() {
        organization.subscription.set('currentUsageRatio', '0.999');
      });

      it('shows 99% and "More Info" link', async function() {
        await this.render(hbs`{{notice-bar organization=organization}}`);

        expect(NoticeBar.percentage.text).to.equal('99%');
        expect(NoticeBar.buttonLink.text).to.equal('More Info');

        await percySnapshot(this.test);
      });
    });

    describe('when 101% of snapshots have been used', function() {
      beforeEach(function() {
        organization.subscription.set('currentUsageRatio', '1.01');
      });

      it('shows all have been used and "Upgrade Plan" link', async function() {
        await this.render(hbs`{{notice-bar organization=organization}}`);

        expect(NoticeBar.percentage.text).to.equal('all');
        expect(NoticeBar.buttonLink.text).to.equal('Upgrade Plan');

        await percySnapshot(this.test);
      });
    });
  });

  describe('Trial Bar', function() {
    beforeEach(function() {
      organization = make('organization', 'withTrialPlan');
      organization.set('_filteredOrganizationUsers', [make('user')]);
      this.setProperties({
        organization,
      });
    });

    describe('when no trial days are left', function() {
      it('shows "Your trial ends today!" and "See plans"', async function() {
        await this.render(hbs`{{notice-bar organization=organization}}`);

        expect(NoticeBar.message.text).to.equal('Your trial ends today!');
        expect(NoticeBar.buttonLink.text).to.equal('See plans');

        await percySnapshot(this.test);
      });
    });

    describe('when 2 trial days are left', function() {
      it('shows "Your trial ends today!" and "See plans"', async function() {
        organization.subscription.set('trialDaysRemaining', 2);

        await this.render(hbs`{{notice-bar organization=organization}}`);

        expect(NoticeBar.message.text).to.equal('You have 2 days left in your trial.');
        expect(NoticeBar.buttonLink.text).to.equal('See plans');

        await percySnapshot(this.test);
      });
    });
  });
});
