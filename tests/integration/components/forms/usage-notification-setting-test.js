import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import percySnapshot from '@percy/ember';
import {render} from '@ember/test-helpers';

describe('Integration: UsageNotificationSettingForm', function() {
  setupRenderingTest('forms/usage-notification-setting', {
    integration: true,
  });

  let organization;
  let setting;

  beforeEach(function() {
    setupFactoryGuy(this);
    UsageNotificationSettingForm.setContext(this);
  });

  describe('when a setting exists', function() {
    beforeEach(async function() {
      organization = make('organization', 'withUsageNotificationSetting');
      setting = organization.get('usageNotificationSetting');
      setting.set('thresholds', {'snapshot-count': ['1', '20', '33000']});
      this.set('organization', organization);
      this.set('setting', setting);
      await render(hbs`{{forms/usage-notification-setting
        organization=organization
        setting=setting}}`);
    });

    it('displays setting information', async function() {
      expect(UsageNotificationSettingForm.isVisible).to.equal(true);
      expect(UsageNotificationSettingForm.isEnabled).to.equal(true);
      expect(UsageNotificationSettingForm.emails.value).to.equal(setting.emails.join(' '));
      expect(UsageNotificationSettingForm.thresholds.value).to.equal('1 20 33,000');

      await percySnapshot(this.test);
    });
  });

  describe('when a setting does not exist', function() {
    beforeEach(async function() {
      organization = make('organization');
      this.set('organization', organization);
      await render(hbs`{{forms/usage-notification-setting organization=organization}}`);
    });

    it('renders', async function() {
      expect(UsageNotificationSettingForm.isVisible).to.equal(true);
      expect(UsageNotificationSettingForm.isEnabled).to.equal(false);

      await percySnapshot(this.test);
    });

    it('requires emails', async function() {
      await UsageNotificationSettingForm.emails.fillIn('');
      expect(UsageNotificationSettingForm.errors.text).to.match(/can't be blank/);
      await percySnapshot(this.test.fullTitle() + ' cannot be blank');

      await UsageNotificationSettingForm.emails.fillIn('random garbage');
      expect(UsageNotificationSettingForm.errors.text).to.match(/valid and separated by spaces/);
      await percySnapshot(this.test.fullTitle() + ' requires valid data');
    });

    it('requires thresholds', async function() {
      await UsageNotificationSettingForm.thresholds.fillIn('');
      expect(UsageNotificationSettingForm.errors.text).to.match(/can't be blank/);
      await percySnapshot(this.test.fullTitle() + ' cannot be blank');

      await UsageNotificationSettingForm.thresholds.fillIn('random garbage');
      expect(UsageNotificationSettingForm.errors.text).to.match(/numbers separated by spaces/);
      await percySnapshot(this.test.fullTitle() + ' requires valid data');
    });
  });
});
