import {hash} from 'rsvp';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),

  model(params) {
    const organization = this.modelFor('organization');
    const project = this.modelFor('organization.project');
    const projects = this.store.query('project', {organization: organization});
    let webhookConfig;

    if (params.webhook_config_id == 'new') {
      webhookConfig = this.store.createRecord('webhookConfig', {
        project: project,
      });
    } else {
      webhookConfig = this.store.findRecord('webhookConfig', params.webhook_config_id);
    }

    return hash({organization, project, projects, webhookConfig});
  },

  actions: {
    webhookConfigUpdated(webhookConfig) {
      const organization = this.modelFor('organization');
      const project = this.modelFor('organization.project');

      // Ensures the route is updated with the webhook config's new ID,
      // in case it was a new record.
      this.replaceWith(
        'organization.project.integrations.webhooks.webhook-config',
        organization.slug,
        project.slug,
        webhookConfig.id,
      );

      this.flashMessages.success('Webhook configuration saved');
    },

    willTransition() {
      let model = this.store.peekAll('webhook-config').findBy('isNew', true);
      if (model) {
        this.store.unloadRecord(model);
      }
    },
  },
});
