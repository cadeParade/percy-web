import {collection, create, visitable} from 'ember-cli-page-object';
import {alias} from 'ember-cli-page-object/macros';
import {SlackSettings} from 'percy-web/tests/pages/components/organizations/slack-settings';
import SlackIntegrationItem from 'percy-web/tests/pages/components/organizations/slack-integration-item'; // eslint-disable-line

export const SELECTORS = {
  CONTAINER: '[data-test-slack-integration-page]',
};

const SlackIntegrationPage = {
  scope: SELECTORS.CONTAINER,
  visitSlackIntegration: visitable('/organizations/:orgSlug/integrations/slack'),
  slackSettings: SlackSettings,
  addChannelButton: alias('slackSettings.addChannelButton'),
  integrationItems: collection(SlackIntegrationItem.scope, SlackIntegrationItem),
};

export default create(SlackIntegrationPage);
