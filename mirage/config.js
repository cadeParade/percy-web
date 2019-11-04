import Mirage from 'ember-cli-mirage';
import faker from 'faker';
import {REVIEW_COMMENT_TYPE} from 'percy-web/models/comment-thread';
import {
  SNAPSHOT_APPROVED_STATE,
  SNAPSHOT_REJECTED_STATE,
  SNAPSHOT_REVIEW_STATE_REASONS,
} from 'percy-web/models/snapshot';
import {REVIEW_ACTIONS} from 'percy-web/models/review';
import {get} from '@ember/object';

export default function() {
  // Enable this to see verbose request logging from mirage:
  // this.logging = true;
  this.passthrough('http://api.amplitude.com');
  this.passthrough('https://api.lever.co/v0/postings/percy');

  this.passthrough('https://preview.contentful.com/spaces/:space_id/environments/test/entries');
  this.passthrough('https://preview.contentful.com/spaces/:space_id/environments/test/entries/**');

  this.get('/api/auth/session', function() {
    return {state: 'foo'};
  });

  this.get('/api/auth/logout', function(schema) {
    let user = schema.users.findBy({_currentLoginInTest: true});
    if (user) {
      user.update({_currentLoginInTest: false});
    }
    return new Mirage.Response(200, {}, {success: true});
  });

  this.post('/api/websockets/auth', function() {
    return {auth: 'abc123'};
  });

  this.namespace = '/api/v1';

  this.get('/user', function(schema) {
    let user = schema.users.findBy({_currentLoginInTest: true});
    if (user) {
      return user;
    } else {
      return _error401;
    }
  });

  this.patch('/user', function(schema) {
    let user = schema.users.findBy({_currentLoginInTest: true});
    let attrs = this.normalizedRequestAttrs('user');

    user.update({name: attrs.name, unverifiedEmail: attrs.email});
    return user;
  });

  this.get('/user/identities', function(schema) {
    let user = schema.users.findBy({_currentLoginInTest: true});
    if (!user) {
      return _error401;
    }
    return schema.identities.where({userId: user.id});
  });

  this.get('/user/identities/:id', function(schema, request) {
    return schema.identities.findBy({id: request.params.id});
  });

  this.post('/user/identities/:id/password-change-request', function() {
    return new Mirage.Response(204);
  });

  this.post('/user/identities', function(schema, request) {
    if (request.requestBody.match(/password%5D=passwordStrengthError!123$/)) {
      return _error400({statusDetail: 'PasswordStrengthError: Password is too weak'});
    } else if (request.requestBody.match(/password%5D=badRequestWithNoDetail!123$/)) {
      return _error400();
    } else {
      return new Mirage.Response(201, {}, {success: true});
    }
  });

  this.get('/user/organizations', function(schema) {
    let user = schema.users.findBy({_currentLoginInTest: true});
    if (!user) {
      return {errors: [{status: '403', title: 'unauthorized'}]};
    }
    let organizationUsers = schema.organizationUsers.where({userId: user.id});
    let organizationIds = organizationUsers.models.map(obj => obj.organizationId);
    return schema.organizations.find(organizationIds);
  });

  this.patch('/email-verifications/**', function(schema, request) {
    if (request.params['*'] === 'goodCode') {
      return new Mirage.Response(200, {}, {success: true});
    } else {
      return _error400({statusDetail: 'it did not work'});
    }
  });

  this.get('/organizations/:slug', function(schema, request) {
    const org = schema.organizations.findBy({slug: request.params.slug});
    return org ? org : _error401;
  });

  this.patch('/organizations/:slug', function(schema, request) {
    let attrs = this.normalizedRequestAttrs('organization');
    if (!attrs.slug.match(/^[a-zA-Z][a-zA-Z_]*[a-zA-Z]$/)) {
      return _error400({
        pointer: '/data/attributes/slug',
        sourceDetail:
          'Slug must only contain letters, numbers, dashes, and cannot begin or end with a dash.',
      });
    }

    let organization = schema.organizations.findBy({slug: request.params.slug});
    organization.update(attrs);
    return organization;
  });

  this.post('/organizations', function(schema) {
    let attrs = this.normalizedRequestAttrs('organization');
    let currentUser = schema.users.findBy({_currentLoginInTest: true});
    attrs.slug = attrs.name.underscore();
    let result = schema.organizations.create(attrs);
    schema.organizationUsers.create({
      userId: currentUser.id,
      organizationId: result.id,
    });
    return result;
  });

  this.post('/comments', function(schema) {
    const attrs = this.normalizedRequestAttrs('comment');
    const currentUser = schema.users.findBy({_currentLoginInTest: true});
    const snapshot = attrs.snapshotId && schema.snapshots.find(attrs.snapshotId);
    let commentThread;
    if (attrs.commentThreadId) {
      commentThread = schema.commentThreads.findBy({id: attrs.commentThreadId});
    } else {
      commentThread = schema.commentThreads.create({
        type: attrs.threadType,
        snapshotId: attrs.snapshotId,
        createdAt: new Date(),
        originatingSnapshotId: get(snapshot, 'id'),
      });

      if (attrs.threadType === REVIEW_COMMENT_TYPE) {
        snapshot.update({
          reviewState: SNAPSHOT_REJECTED_STATE,
          reviewStateReason: SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED,
        });
      }
    }

    const newComment = schema.comments.create({
      commentThread: commentThread,
      body: attrs.body,
      author: currentUser,
    });

    return newComment;
  });

  this.patch('/comment-threads/:id', function(schema) {
    let attrs = this.normalizedRequestAttrs('comment-thread');
    let currentUser = schema.users.findBy({_currentLoginInTest: true});
    attrs.closedBy = currentUser;

    let commentThread = schema.commentThreads.findBy({id: attrs.id});
    commentThread.update(attrs);
    return commentThread;
  });

  this.post('/organizations/:id/projects', function(schema, request) {
    let attrs = this.normalizedRequestAttrs('project');
    // we are looking for the id in this case because the api treats the slug as the id
    const organization = schema.organizations.findBy({slug: request.params.id});

    const numProjects = schema.projects.all().models.length;
    const _name = attrs.isDemo ? 'My cool demo project' : 'My cool project';
    const projectName = attrs.name ? attrs.name : `${_name} ${numProjects}`;
    attrs.name = projectName;
    attrs.slug = projectName.dasherize();
    attrs.fullSlug = `${organization.slug.dasherize()}/${attrs.slug}`;
    attrs.isEnabled = true;
    return schema.projects.create(attrs);
  });

  this.patch('/organizations/:slug/subscription', function(schema, request) {
    let attrs = this.normalizedRequestAttrs('subscription');
    let organization = schema.organizations.findBy({slug: request.params.slug});
    let subscription = organization.subscription;

    // Mimic backend email validation.
    if (!attrs.billingEmail.match(/^[a-zA-Z0-9_]+@[a-zA-Z0-9_.]+$/)) {
      return _error400({
        pointer: '/data/attributes/billing-email',
        sourceDetail: 'Billing email is invalid',
      });
    }
    subscription.update(attrs);
    return subscription;
  });

  this.get('/organizations/:slug/organization-users', function(schema, request) {
    // TODO handle ?filter=current-user-only
    let organization = schema.organizations.findBy({slug: request.params.slug});
    return schema.organizationUsers.where({organizationId: organization.id});
  });

  this.delete('/organization-users/:id', function(schema, request) {
    schema.organizationUsers.find(request.params.id).destroy();
    return new Mirage.Response(204);
  });

  this.get('/organizations/:slug/projects', function(schema, request) {
    let organization = schema.organizations.findBy({slug: request.params.slug});
    const projects = schema.projects.where({organizationId: organization.id});
    let filteredProjects = projects.filter(project => project.isEnabled);

    const queryParams = request.queryParams;
    if ('enabled' in queryParams) {
      if (queryParams['enabled'] === 'all') {
        filteredProjects = projects;
      } else if (queryParams['enabled'] === 'false') {
        filteredProjects = projects.filter(project => !project.isEnabled);
      }
    }
    return filteredProjects;
  });

  this.post('/organizations/:org_id/version-control-integrations/', function(schema, request) {
    if (request.requestBody.match(/"integration-type":"gitlab"/)) {
      let attrs = this.normalizedRequestAttrs('version-control-integration');
      let newAttrs = Object.assign({}, attrs, {gitlabIntegrationId: 1234});
      let versionControlIntegration = schema.versionControlIntegrations.create(newAttrs);
      return versionControlIntegration;
    } else if (request.requestBody.match(/"integration-type":"gitlab_self_hosted"/)) {
      let attrs = this.normalizedRequestAttrs('version-control-integration');
      let versionControlIntegration = schema.versionControlIntegrations.create(attrs);
      return versionControlIntegration;
    } else {
      return new Mirage.Response(422, {}, {});
    }
  });

  this.patch('/version-control-integrations/:id', function(schema, request) {
    if (request.requestBody.match(/"integration-type":"gitlab"/)) {
      let attrs = this.normalizedRequestAttrs('version-control-integration');
      let newAttrs = Object.assign({}, attrs, {
        gitlabIntegrationId: 1234,
        isGitlabPersonalAccessTokenPresent: true,
      });
      let versionControlIntegration = schema.versionControlIntegrations.findBy({
        id: request.params.id,
      });
      versionControlIntegration.update(newAttrs);
      return versionControlIntegration;
    } else if (request.requestBody.match(/"integration-type":"gitlab_self_hosted"/)) {
      let attrs = this.normalizedRequestAttrs('version-control-integration');
      let newAttrs = Object.assign({}, attrs, {
        gitlabHost: attrs['gitlabHost'],
        isGitlabPersonalAccessTokenPresent: true,
      });
      let versionControlIntegration = schema.versionControlIntegrations.findBy({
        id: request.params.id,
      });
      versionControlIntegration.update(newAttrs);
      return versionControlIntegration;
    } else {
      return new Mirage.Response(422, {}, {});
    }
  });

  this.delete('/version-control-integrations/:id', function(schema, request) {
    schema.versionControlIntegrations.find(request.params.id).destroy();
    return new Mirage.Response(204);
  });

  this.get('/projects/:full_slug/', function(schema, request) {
    const fullSlug = decodeURIComponent(request.params.full_slug);
    const project = schema.projects.findBy({fullSlug: fullSlug});
    return project ? project : _error401;
  });

  this.get('/projects/:organization_slug/:project_slug/tokens', function(schema, request) {
    let fullSlug = `${request.params.organization_slug}/${request.params.project_slug}`;
    let project = schema.projects.findBy({fullSlug: fullSlug});
    return schema.tokens.where({projectId: project.id});
  });

  this.get('/projects/:organization_slug/:project_slug/builds', function(schema, request) {
    let limitString = request.queryParams['page[limit]'] || '50';
    let limit = parseInt(limitString);

    let fullSlug = `${request.params.organization_slug}/${request.params.project_slug}`;
    let project = schema.projects.findBy({fullSlug: fullSlug});

    let projectBuilds = schema.builds.where({projectId: project.id});
    let limitedProjectBuilds = projectBuilds.slice(0, limit);

    return limitedProjectBuilds;
  });

  this.get('/invites/:id');

  this.patch('/invites/:id', function(schema, request) {
    let invite = schema.invites.find(request.params.id);
    let attrs = this.normalizedRequestAttrs('invite');
    invite.update(attrs);

    const currentUser = schema.users.findBy({_currentLoginInTest: true});
    schema.organizationUsers.create({userId: currentUser.id, organizationId: attrs.organizationId});

    return invite;
  });
  this.delete('/invites/:id', function(schema, request) {
    schema.invites.find(request.params.id).destroy();
    return new Mirage.Response(204);
  });

  this.get('/organizations/:organization_slug/invites');
  this.post('/organizations/:organization_slug/invites', function(schema) {
    let attrs = this.normalizedRequestAttrs();
    // The endpoint can create multiple invites, but in the test we're only doing one
    schema.invites.create({
      organizationId: attrs.organizationId,
      email: attrs.emails,
    });
    // The real API response is an invite with a generic invite code
    return schema.invites.new({id: 'created'});
  });

  this.get('/builds/:build_id/snapshots', function(schema, request) {
    const build = schema.builds.findBy({id: request.params.build_id});
    const queryParams = request.queryParams;
    if (queryParams['filter[review-state-reason]']) {
      const reasons = queryParams['filter[review-state-reason]'].split(',');
      return schema.snapshots.where(snapshot => {
        return snapshot.buildId === build.id && reasons.includes(snapshot.reviewStateReason);
      });
    } else {
      return schema.snapshots.where({buildId: build.id});
    }
  });

  this.get('/builds/:build_id/removed-snapshots', function(schema, request) {
    const build = schema.builds.findBy({id: request.params.build_id});
    const baseBuild = build.baseBuild;
    if (!baseBuild) {
      return {data: []};
    }

    const headSnapshotNames = build.snapshots.models.mapBy('name');
    const baseSnapshotNames = baseBuild.snapshots.models.mapBy('name');

    var _difference = new Set(baseSnapshotNames);
    for (var elem of headSnapshotNames) {
      _difference.delete(elem);
    }

    const removedSnapshotIds = [..._difference].map(name => {
      return baseBuild.snapshots.models.findBy('name', name).id;
    });

    return schema.snapshots.find(removedSnapshotIds);
  });

  this.get('/browser-families', function(schema) {
    schema.browserFamilies.create({
      id: '1',
      slug: 'firefox',
      name: 'Firefox',
    });
    schema.browserFamilies.create({
      id: '2',
      slug: 'chrome',
      name: 'Chrome',
    });

    return schema.browserFamilies.find(['1', '2']);
  });

  this.post('/reviews', function(schema) {
    const attrs = this.normalizedRequestAttrs();
    const snapshots = schema.snapshots.find(attrs.snapshotIds);
    const reviewState =
      attrs.action === REVIEW_ACTIONS.APPROVE ? SNAPSHOT_APPROVED_STATE : SNAPSHOT_REJECTED_STATE;
    const reviewStateReason =
      attrs.action === REVIEW_ACTIONS.APPROVE
        ? SNAPSHOT_REVIEW_STATE_REASONS.USER_APPROVED
        : SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED;

    snapshots.models.forEach(snapshot => {
      snapshot.update({reviewState, reviewStateReason});
    });

    if (attrs.action === REVIEW_ACTIONS.REJECT) {
      const currentUser = schema.users.findBy({_currentLoginInTest: true});
      snapshots.models.forEach(snapshot => {
        const commentThread = schema.commentThreads.create({
          type: REVIEW_COMMENT_TYPE,
          snapshotId: snapshot.id,
          createdAt: new Date(),
          originatingSnapshotId: snapshot.id,
        });
        schema.comments.create({
          commentThread: commentThread,
          body: '',
          author: currentUser,
        });
      });
    }

    return schema.reviews.create({
      buildId: attrs.buildId,
      snapshotIds: attrs.snapshotIds,
      action: attrs.action,
    });
  });

  this.get('/snapshots/:id');
  this.get('/builds/:id');
  this.get('/builds/:build_id/comparisons');
  this.get('/repos/:id');
  this.post('/user-notification-setting');
  this.patch('/user-notification-setting/:id');

  // Slack
  this.post('/organizations/:organization_id/slack-integrations', function(schema) {
    return schema.slackIntegrations.create({
      teamName: faker.company.companyName(),
      channelName: `#${faker.lorem.slug()}`,
    });
  });
  this.delete('/slack-integrations/:id', function(schema, request) {
    schema.slackIntegrations.find(request.params.id).destroy();
    return new Mirage.Response(204);
  });
  this.post('/organizations/:organization_id/slack-integration-requests', function() {
    return {slack_auth_url: 'fake_slack_oauth_url'};
  });
  this.post('/slack-integrations/:slack_integration_id/slack-integration-configs', function(
    schema,
  ) {
    const attrs = this.normalizedRequestAttrs();
    return schema.slackIntegrationConfigs.create({
      slackIntegrationId: attrs.slackIntegrationId,
      projectId: attrs.projectId,
      notificationTypes: attrs.notificationTypes,
    });
  });
  this.patch('/slack-integrations/:slack_integration_id/slack-integration-configs/:id', function(
    schema,
  ) {
    const attrs = this.normalizedRequestAttrs();
    const config = schema.slackIntegrationConfigs.findBy({id: attrs.id});
    config.update(attrs);
    return config;
  });
  this.delete('/slack-integrations/:slack_integration_id/slack-integration-configs/:id', function(
    schema,
    request,
  ) {
    schema.slackIntegrationConfigs.find(request.params.id).destroy();
    return new Mirage.Response(204);
  });
}

const _error401 = new Mirage.Response(
  401,
  {},
  {
    errors: [
      {
        status: 'unauthorized',
        detail: 'Authentication required.',
      },
    ],
  },
);

function _error400({statusDetail = '', pointer = ' ', sourceDetail = ''} = {}) {
  const errorsStatus = {status: 'bad_request'};
  const errorsSource = {};
  if (status) {
    errorsStatus.status = status;
  }
  if (statusDetail) {
    errorsStatus.detail = statusDetail;
  }
  if (pointer) {
    errorsStatus.source = {pointer};
  }
  if (sourceDetail) {
    errorsStatus.detail = sourceDetail;
  }

  return new Mirage.Response(
    400,
    {},
    {
      errors: [errorsStatus, errorsSource],
    },
  );
}
