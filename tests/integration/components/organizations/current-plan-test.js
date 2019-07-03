import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line
import CurrentPlan from 'percy-web/tests/pages/components/organizations/current-plan';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {percySnapshot} from 'ember-percy';

describe('Integration: CurrentPlan', function() {
  setupRenderingTest('current-plan', {
    integration: true,
  });

  let orgWFreePlan;
  let orgWSponsoredPlan;
  let orgWPaidPlan;
  let orgWTrialPlan;
  let orgWEnterprisePlan;
  let orgWLegacyPlan;

  beforeEach(function() {
    setupFactoryGuy(this);
    CurrentPlan.setContext(this);
  });

  describe('rendering realistic combinations', function() {
    beforeEach(function() {
      setupFactoryGuy(this);
      CurrentPlan.setContext(this);
      orgWFreePlan = make('organization', 'withFreePlan');
      orgWTrialPlan = make('organization', 'withTrialPlan');
      orgWPaidPlan = make('organization', 'withPaidPlan');
      orgWSponsoredPlan = make('organization', 'withSponsoredPlan');
      orgWEnterprisePlan = make('organization', 'withEnterprisePlan');
      orgWLegacyPlan = make('organization', 'withLegacyPlan');

      const usageStats = make('usage-stat');

      this.setProperties({
        orgWFreePlan,
        orgWPaidPlan,
        orgWSponsoredPlan,
        orgWTrialPlan,
        orgWEnterprisePlan,
        orgWLegacyPlan,
        usageStats,
      });
    });

    it('renders all combinations', async function() {
      await this.render(hbs`
        <div class="m1 font-semibold">Trial plan</div>
        {{organizations/current-plan
          organization=orgWTrialPlan
        }}

        <div class="m1 font-semibold">Free plan</div>
        {{organizations/current-plan
          organization=orgWFreePlan
        }}

        <div class="m1 font-semibold">V3 self-serve plan</div>
        {{organizations/current-plan
          organization=orgWPaidPlan
          currentUsageStats=usageStats
        }}

        <div class="m1 font-semibold">Legacy plan</div>
        {{organizations/current-plan
          organization=orgWLegacyPlan
          currentUsageStats=usageStats
        }}

        <div class="m1 font-semibold">Sponsored plan</div>
        {{organizations/current-plan
          organization=orgWSponsoredPlan
        }}

        <div class="m1 font-semibold">Enterprise plan</div>
        {{organizations/current-plan
          organization=orgWEnterprisePlan
        }}
      `);
      await percySnapshot(this.test);
    });

    it('displays trial plan correctly', async function() {
      await this.render(hbs`{{organizations/current-plan
        organization=orgWTrialPlan
      }}`);

      expect(CurrentPlan.isSnapshotsIncludedVisible).to.equal(true);
      expect(CurrentPlan.isUserLimitVisible).to.equal(true);
      expect(CurrentPlan.isMonthlyCostVisible).to.equal(false);
      expect(CurrentPlan.isOveragesVisible).to.equal(false);
      expect(CurrentPlan.isUsageStatsVisible).to.equal(false);
      expect(CurrentPlan.isTrialBlurbVisible).to.equal(true);
    });

    it('displays free plan correctly', async function() {
      await this.render(hbs`{{organizations/current-plan
        organization=orgWFreePlan
      }}`);

      expect(CurrentPlan.isSnapshotsIncludedVisible).to.equal(true);
      expect(CurrentPlan.isUserLimitVisible).to.equal(true);
      expect(CurrentPlan.isMonthlyCostVisible).to.equal(false);
      expect(CurrentPlan.isOveragesVisible).to.equal(false);
      expect(CurrentPlan.isUsageStatsVisible).to.equal(false);
      expect(CurrentPlan.isFreeBlurbVisible).to.equal(true);
    });

    it('displays v3 self-serve plan correctly', async function() {
      await this.render(hbs`{{organizations/current-plan
        organization=orgWPaidPlan
      }}`);

      expect(CurrentPlan.isSnapshotsIncludedVisible).to.equal(true);
      expect(CurrentPlan.isUserLimitVisible).to.equal(true);
      expect(CurrentPlan.isMonthlyCostVisible).to.equal(true);
      expect(CurrentPlan.isOveragesVisible).to.equal(true);
      expect(CurrentPlan.isUsageStatsVisible).to.equal(true);
      expect(CurrentPlan.isContactBlurbVisible).to.equal(true);
    });

    it('displays legacy plan correctly', async function() {
      await this.render(hbs`{{organizations/current-plan
        organization=orgWLegacyPlan
      }}`);

      expect(CurrentPlan.isSnapshotsIncludedVisible).to.equal(true);
      expect(CurrentPlan.isUserLimitVisible).to.equal(true);
      expect(CurrentPlan.isMonthlyCostVisible).to.equal(true);
      expect(CurrentPlan.isOveragesVisible).to.equal(true);
      expect(CurrentPlan.isUsageStatsVisible).to.equal(true);
      expect(CurrentPlan.isDeprecatedBlurbVisible).to.equal(true);
    });

    it('displays sponsored plan correctly', async function() {
      await this.render(hbs`{{organizations/current-plan
        organization=orgWSponsoredPlan
      }}`);

      expect(CurrentPlan.isSnapshotsIncludedVisible).to.equal(true);
      expect(CurrentPlan.isUserLimitVisible).to.equal(true);
      expect(CurrentPlan.isMonthlyCostVisible).to.equal(false);
      expect(CurrentPlan.isOveragesVisible).to.equal(false);
      expect(CurrentPlan.isUsageStatsVisible).to.equal(false);
      expect(CurrentPlan.isContactBlurbVisible).to.equal(true);
    });

    it('displays enterprise plan correctly', async function() {
      await this.render(hbs`{{organizations/current-plan
        organization=orgWEnterprisePlan
      }}`);

      expect(CurrentPlan.isSnapshotsIncludedVisible).to.equal(true);
      expect(CurrentPlan.isUserLimitVisible).to.equal(true);
      expect(CurrentPlan.isMonthlyCostVisible).to.equal(false);
      expect(CurrentPlan.isOveragesVisible).to.equal(true);
      expect(CurrentPlan.isUsageStatsVisible).to.equal(false);
      expect(CurrentPlan.isContactBlurbVisible).to.equal(true);
    });
  });
});
