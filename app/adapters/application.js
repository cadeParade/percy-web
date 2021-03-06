import JSONAPIAdapter from '@ember-data/adapter/json-api';
import {computed} from '@ember/object';
import utils from 'percy-web/lib/utils';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import AdminMode from 'percy-web/lib/admin-mode';

export default class Application extends JSONAPIAdapter.extend(DataAdapterMixin) {
  namespace = 'api/v1';
  authorizer = 'authorizer:jwt';

  @computed
  get headers() {
    let headers = {};

    if (AdminMode.isAdmin()) {
      headers['X-Percy-Mode'] = AdminMode.getAdminMode();
    }
    return headers;
  }

  isInvalid(status) {
    // NOTE: right now, the Percy API uses HTTP 400 when it should use HTTP 422 in many cases.
    // For that reason, we need to add 400 to the isInvalid check so that model.errors is populated
    // correctly.
    // TODO: when the API is changed to be more correct, we should drop this method.
    return status === 422 || status === 400;
  }

  buildURL(modelName, id, snapshot, requestType, query) {
    // NOTE: for certain objects we don't expose a top-level API object and only operate on the
    // nested route. Because of that, some requests have to be transformed here.

    // Singular /user API that returns the current user (different from the /users API).
    if (requestType === 'queryRecord' && modelName === 'user' && id === null) {
      return utils.buildApiUrl('user');
    }
    // Singular /user API that patches the current user
    if (requestType === 'updateRecord' && modelName === 'user' && id) {
      return utils.buildApiUrl('user');
    }
    // DELETE /api/v1/user/identities/:identity_id
    if (requestType === 'deleteRecord' && modelName === 'identity' && id) {
      return utils.buildApiUrl('userIdentity', id);
    }
    // Use organization nested, singular /organizations/:org_id/github-integration-request route.
    if (modelName === 'github-integration-request') {
      // TODO: use adapterOptions for this.
      let organizationSlug = snapshot.record.get('_orgForAdapter.slug');
      return utils.buildApiUrl('githubIntegrationRequest', organizationSlug);
    }
    if (requestType === 'createRecord' && modelName === 'project') {
      return utils.buildApiUrl('projectsCollection', snapshot.record.get('organization.slug'));
    }
    // Use the nested /organizations/:org_id/projects collection route.
    if (requestType === 'query' && modelName === 'project') {
      let organization = query.organization;
      delete query.organization;
      return utils.buildApiUrl('projectsCollection', organization.get('slug'));
    }
    // Use the nested /organizations/:org_id/invites collection route for index and create.
    if (requestType === 'query' && modelName === 'invite') {
      let organization = query.organization;
      delete query.organization;
      return utils.buildApiUrl('invites', organization.get('slug'));
    }
    if (requestType === 'createRecord' && modelName === 'invite') {
      return utils.buildApiUrl('invites', snapshot.record.get('organization.slug'));
    }
    // Use the nested /organizations/:org_id/version-control-integrations route
    if (requestType === 'createRecord' && modelName === 'version-control-integration') {
      return utils.buildApiUrl(
        'organizationVersionControlIntegrations',
        snapshot.record.get('organization.id'),
      );
    }
    // Use the nested /organizations/:org_id/usage-notification-setting route
    if (requestType === 'createRecord' && modelName === 'usage-notification-setting') {
      return utils.buildApiUrl(
        'organizationUsageNotificationSettings',
        snapshot.record.get('organization.slug'),
      );
    }

    // Use the nested /organizations/:org_id/organization-users collection route.
    if (requestType === 'query' && modelName === 'organization-user') {
      let organization = query.organization;
      delete query.organization;
      // Query params are handled elsewhere in Ember, we just need the base URL here.
      return utils.buildApiUrl('organizationUsers', organization.get('slug'));
    }
    // Use the nested /projects/:org_id/:project_id/builds collection route.
    if (requestType === 'query' && modelName === 'build') {
      let project = query.project;
      delete query.project;
      return utils.buildApiUrl('projectBuilds', project.get('fullSlug'));
    }
    // Use the nested, singular /organizations/:org_id/subscription route for the org subscription.
    if (modelName === 'subscription') {
      return utils.buildApiUrl('subscription', snapshot.record.get('organization.slug'));
    }

    if (requestType === 'query' && modelName === 'organization' && query.user) {
      delete query.user;
      return utils.buildApiUrl('userOrganizations');
    }

    // /api/v1/organizations/%@/slack-integrations
    if (requestType === 'createRecord' && modelName === 'slack-integration') {
      return utils.buildApiUrl('slackIntegrations', snapshot.record.get('organization.slug'));
    }
    // /api/v1/slack-integrations/%@/slack-integration-configs
    if (requestType === 'createRecord' && modelName === 'slack-integration-config') {
      let integrationId = snapshot.record.get('slackIntegration.id');
      return utils.buildApiUrl('slackIntegrationConfigs', integrationId);
    }
    // /api/v1/slack-integrations/%@/slack-integration-config/%@
    if (requestType === 'updateRecord' && modelName === 'slack-integration-config' && id) {
      let integrationId = snapshot.record.get('slackIntegration.id');
      return utils.buildApiUrl('slackIntegrationConfig', integrationId, id);
    }
    // /api/v1/slack-integrations/%@/slack-integration-configs/%@
    if (requestType === 'deleteRecord' && modelName === 'slack-integration-config' && id) {
      let integrationId = snapshot.record.get('slackIntegration.id');
      return utils.buildApiUrl('slackIntegrationConfig', integrationId, id);
    }

    // /api/v1/builds/:build_id/comment-threads/
    if (requestType === 'query' && modelName === 'comment-thread') {
      const buildId = query.filter.build;
      return utils.buildApiUrl('buildCommentThreads', buildId);
    }

    // Customize buildURL for models where we want to use the slug as the ID in the API URL, but
    // keep the internal ID stable. TODO: remove this when Ember Data fully supports JSON-API
    // self links.
    if (id && modelName === 'organization') {
      let changedAttributes = snapshot.changedAttributes();
      let changedSlug = changedAttributes.slug && changedAttributes.slug[0];
      let originalSlug = snapshot.record.get('slug');

      // Handle: 1) slug changed, 2) slug has not changed, 3) slug does not exist.
      id = changedSlug || originalSlug || id;
    }
    if (id && modelName === 'project') {
      let changedAttributes = snapshot.changedAttributes();
      let changedSlug = changedAttributes.slug && changedAttributes.slug[0];
      let originalSlug = snapshot.record.get('slug');

      // Handle: 1) slug changed, 2) slug has not changed, 3) slug does not exist.
      id = changedSlug || originalSlug || id;

      // Two cases need to be handled:
      // 1) On initial load, the project route contructs full slug id (org/project) based on the
      // URL. No organization relationship is present at that point, so we do nothing here.
      // 2) When the model is actually loaded, the full slug id now needs to be constructed for each
      // API call, so we add the organization slug here which completes the full slug.
      if (id.indexOf('/') === -1) {
        let organizationSlug = snapshot.record.get('organization.slug');
        id = `${organizationSlug}/${id}`;
      }
    }

    return super.buildURL(modelName, id, snapshot, requestType, query);
  }

  createRecordManual(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);
    let url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

    serializer.serializeIntoHash(data, type, snapshot, {includeId: true});

    return this.ajax(url, 'POST', {data: data}).then(response => {
      store.pushPayload(response);
      return store.peekRecord(type.modelName, response.data.id);
    });
  }
}
