import GitlabCommon from 'percy-web/routes/organizations/organization/integrations/gitlab-common';
import {GITLAB_INTEGRATION_TYPE} from 'percy-web/lib/integration-types';

export default class GitlabRoute extends GitlabCommon {
  currentIntegrationType = GITLAB_INTEGRATION_TYPE;
}
