import {it, describe, beforeEach} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import WebhookConfigEditForm from 'percy-web/tests/pages/components/forms/webhook-config-edit';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

describe('Integration: WebhookConfigEditForm', function() {
  setupComponentTest('forms/webhook-config-edit', {
    integration: true,
  });

  let webhookConfig;

  beforeEach(function() {
    setupFactoryGuy(this.container);
    WebhookConfigEditForm.setContext(this);
    webhookConfig = make('webhook-config');
    this.set('webhookConfig', webhookConfig);
    this.render(hbs`{{forms/webhook-config-edit webhookConfig=webhookConfig}}`);
  });

  it('displays webhook config in form', function() {
    expect(WebhookConfigEditForm.url).to.equal(webhookConfig.get('url'));
    expect(WebhookConfigEditForm.description).to.equal(webhookConfig.get('description'));
    expect(WebhookConfigEditForm.authToken).to.equal(webhookConfig.get('authToken'));
    expect(WebhookConfigEditForm.subscribedEvents[0].value).to.equal(true);
    expect(WebhookConfigEditForm.subscribedEvents[1].value).to.equal(false);
    expect(WebhookConfigEditForm.subscribedEvents[2].value).to.equal(false);
    expect(WebhookConfigEditForm.subscribedEvents[3].value).to.equal(false);
    expect(WebhookConfigEditForm.sslVerificationEnabled).to.equal('on');
    expect(WebhookConfigEditForm.deliveryEnabled).to.equal('on');
  });

  it('allows submission', function() {
    expect(WebhookConfigEditForm.isSubmitDisabled).to.equal(false);
  });

  it('requires url', function() {
    WebhookConfigEditForm.fillInUrl('');
    expect(WebhookConfigEditForm.isSubmitDisabled).to.equal(true);
    expect(WebhookConfigEditForm.errors).to.match(/Url can't be blank/);
  });

  it('requires valid url', function() {
    WebhookConfigEditForm.fillInUrl('random garbage');
    percySnapshot(this.test.fullTitle());
    expect(WebhookConfigEditForm.isSubmitDisabled).to.equal(true);
    expect(WebhookConfigEditForm.errors).to.match(/Url must be a valid url/);
  });

  it('requires at least one subscribed event', function() {
    WebhookConfigEditForm.subscribedEvents[0].click();
    percySnapshot(this.test.fullTitle());
    expect(WebhookConfigEditForm.isSubmitDisabled).to.equal(true);
    expect(WebhookConfigEditForm.errors).to.match(/Subscribed events can't be blank/);
  });

  it('does not display SSL warning when verification enabled', function() {
    expect(WebhookConfigEditForm.sslWarningPresent).to.equal(false);
  });

  it('displays SSL warning when verification disabled', function() {
    WebhookConfigEditForm.clickSslVerificationEnabled();
    percySnapshot(this.test.fullTitle());
    expect(WebhookConfigEditForm.sslWarningPresent).to.equal(true);
  });
});