import {computed} from '@ember/object';
import Component from '@ember/component';
import WebhookConfigEditValidations from '../../validations/webhook-config-edit';
import {task} from 'ember-concurrency';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';

const SUBSCRIBABLE_EVENTS = [
  {
    label: 'ping',
    value: 'ping',
    description: 'Webhook notification settings have been updated',
  },
  {
    label: 'build_created',
    value: 'build_created',
    description: 'A build has been created',
  },
  {
    label: 'build_approved',
    value: 'build_approved',
    description: 'A build has been approved',
  },
  {
    label: 'build_finished',
    value: 'build_finished',
    description: 'A build has finished',
  },
  {
    label: 'build_changes_requested',
    value: 'build_changes_requested',
    description: 'A build has changes requested',
  },
  {
    label: 'build_unreviewed',
    value: 'build_unreviewed',
    description: 'A build no longer has changes requested',
  },
];

const FORM_FIELD_LABELS = {
  url: {
    title: 'URL',
    subtitle: 'The full URL (including https:// or http://) that will receive webhook events.',
  },

  description: {
    title: 'Description',
    subtitle: 'An optional description to help identify this webhook configuration.',
  },

  authToken: {
    title: 'Secret',
    subtitle:
      'Shared secret used to calculate the value of the X-Percy-Digest ' +
      'request header. See the documentation for instructions in verifying ' +
      'the authenticity of webhook requests.',
  },

  subscribedEvents: {
    title: 'Subscribed events',
    subtitle:
      'The event name will be sent in the X-Percy-Event HTTP header and event ' +
      'property of the webhook payload. See the webhook documentation for a ' +
      'description of each type of payload.',
  },

  sslVerificationEnabled: {
    title: 'SSL certificate verification',
    subtitle: 'Whether to verify the SSL certificate presented by the delivery host.',
  },
};

export default Component.extend({
  classNames: ['FormsWebhookConfigEdit', 'Form'],
  model: computed.alias('webhookConfig'),
  validator: WebhookConfigEditValidations,

  changeset: computed('model', 'validator', function() {
    let model = this.model;
    let validator = this.validator || {};

    return new Changeset(model, lookupValidator(validator), validator);
  }),

  saveText: computed('changeset.isPristine', function() {
    // use get because changeset is a proxy.
    return `${this.changeset.get('isNew') ? 'Create' : 'Update'} webhook`;
  }),

  isSubmitDisabled: computed('changeset.isValid', 'saveWebhookConfig.isRunning', function() {
    // use get because changeset is a proxy.
    return !this.changeset.get('isValid') || this.saveWebhookConfig.isRunning;
  }),

  changesetErrors: computed('changeset.error', function() {
    // use get because changeset is a proxy.
    return this.changeset.get('error');
  }),

  labels: FORM_FIELD_LABELS,

  allOptions: SUBSCRIBABLE_EVENTS,

  actions: {
    toggleSubscribeEvent(subscribedEventValue, isSelected) {
      let oldSelectedSubscribedEvents = this.changeset.get('subscribedEvents');
      let newValue;

      if (isSelected) {
        // If we're enabling the target, add it to the array
        newValue = oldSelectedSubscribedEvents.concat([subscribedEventValue]);
      } else {
        // If we're disabling the target, remove it from the array
        newValue = oldSelectedSubscribedEvents.filter(v => v != subscribedEventValue);
      }
      // Remove duplicates and save.
      this.changeset.set('subscribedEvents', [...new Set(newValue)]);
    },
  },

  saveWebhookConfig: task(function*() {
    if (this.changeset.get('isPristine')) return;

    try {
      yield this.changeset.save();
    } catch (e) {
      this.changeset.rollback();
      this.flashMessages.danger('Something went wrong. Please try again.');
    }
  }),
});
