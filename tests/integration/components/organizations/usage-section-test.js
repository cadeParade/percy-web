import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line
import UsageSection from 'percy-web/tests/pages/components/organizations/usage-section';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {percySnapshot} from 'ember-percy';

describe('Integration: UsageSection', function() {
  setupRenderingTest('usage-section', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    UsageSection.setContext(this);
  });

  describe('usage graph', function() {
    it('displays', async function() {
      const organization = make('organization', 'withPaidPlan');
      this.set('organization', organization);
      await this.render(hbs`{{organizations/usage-section
        organization=organization}}`);

      expect(UsageSection.usageGraphContainer.isVisible).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('usage notification settings', function() {
    describe('visibility', function() {
      async function _expectDoesNotDisplayUsageNotificationSettingWithPlan(context, orgTraits) {
        const organization = make(...['organization'].concat(orgTraits));
        context.set('organization', organization);
        await context.render(hbs`{{organizations/usage-section
          organization=organization}}`);

        expect(UsageSection.usageNotificationSettingForm.isVisible).to.equal(false);
      }

      it('displays when plan is paid', async function() {
        const organization = make('organization', 'withPaidPlan');
        this.set('organization', organization);
        await this.render(hbs`{{organizations/usage-section
          organization=organization}}`);

        expect(UsageSection.usageNotificationSettingForm.isVisible).to.equal(true);
      });

      it('does not display when plan is free', async function() {
        await _expectDoesNotDisplayUsageNotificationSettingWithPlan(this, ['withFreePlan']);
      });

      it('does not display when plan is trial', async function() {
        await _expectDoesNotDisplayUsageNotificationSettingWithPlan(this, ['withTrialPlan']);
      });

      it('does not display when plan is trial', async function() {
        await _expectDoesNotDisplayUsageNotificationSettingWithPlan(this, ['withSponsoredPlan']);
      });
    });

    describe('when a setting exists', function() {
      let setting;
      beforeEach(async function() {
        const organization = make('organization', 'withPaidPlan');
        setting = make('usage-notification-setting', {
          organization,
          thresholds: {'snapshot-count': ['1', '20', '33000']},
        });
        this.setProperties({setting, organization});
        await this.render(hbs`{{organizations/usage-section
          organization=organization
          usageNotificationSetting=setting}}`);
      });

      it('renders the data for the setting', async function() {
        expect(UsageSection.usageNotificationSettingForm.isVisible).to.equal(true);
        expect(UsageSection.usageNotificationSettingForm.isVisible).to.equal(true);
        expect(UsageSection.usageNotificationSettingForm.isEnabled).to.equal(true);
        expect(UsageSection.usageNotificationSettingForm.emails.value).to.equal(
          setting.emails.join(' '),
        );
        expect(UsageSection.usageNotificationSettingForm.thresholds.value).to.equal('1 20 33,000');

        await percySnapshot(this.test);
      });
    });
  });
});
