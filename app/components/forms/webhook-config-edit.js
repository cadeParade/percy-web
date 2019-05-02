import {computed} from '@ember/object';
import BaseFormComponent from './base';
import WebhookConfigEditValidations from '../../validations/webhook-config-edit';

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

export default BaseFormComponent.extend({
  classNames: ['FormsWebhookConfigEdit', 'Form'],
  model: computed.alias('webhookConfig'),
  validator: WebhookConfigEditValidations,

  saveText: computed('changeset.isPristine', function() {
    return `${this.changeset.get('isNew') ? 'Create' : 'Update'} webhook`;
  }),

  isSubmitDisabled: computed('changeset.isValid', function() {
    return !this.changeset.get('isValid');
  }),

  labels: FORM_FIELD_LABELS,

  allOptions: SUBSCRIBABLE_EVENTS,
});
