import GitlabCommon from 'percy-web/routes/organizations/organization/integrations/gitlab-common';
import {GITLAB_SELF_HOSTED_INTEGRATION_TYPE} from 'percy-web/lib/integration-types';

export default class GitlabSelfHostedRoute extends GitlabCommon {
  currentIntegrationType = GITLAB_SELF_HOSTED_INTEGRATION_TYPE;
}
