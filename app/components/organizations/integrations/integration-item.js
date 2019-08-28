import Component from '@ember/component';
import {lookup} from 'percy-web/lib/computed/objectLookup';
import {computed} from '@ember/object';
import {equal, or} from '@ember/object/computed';
import AdminMode from 'percy-web/lib/admin-mode';
import {inject as service} from '@ember/service';

import {GITHUB_ENTERPRISE_INTEGRATION_TYPE} from 'percy-web/lib/integration-types';

import {INTEGRATION_TYPES as INTEGRATIONS_LOOKUP} from 'percy-web/lib/integration-types';

export default Component.extend({
  tagName: '',
  integrationName: null, // required
  integrationStatus: null,
  customInstallButtonAction: null,

  intercom: service(),
  router: service(),

  orgSlug: computed.readOnly('organization.slug'),

  textName: lookup('integrationName', INTEGRATIONS_LOOKUP, 'textName'),
  isBeta: lookup('integrationName', INTEGRATIONS_LOOKUP, 'isBeta'),
  routeSlug: lookup('integrationName', INTEGRATIONS_LOOKUP, 'settingsRouteSlug'),
  iconName: lookup('integrationName', INTEGRATIONS_LOOKUP, 'iconName'),
  betaLink: lookup('integrationName', INTEGRATIONS_LOOKUP, 'betaLink'),
  isGeneralAvailability: lookup('integrationName', INTEGRATIONS_LOOKUP, 'isGeneralAvailability'),
  isIntegrationUnauthorized: equal('integrationStatus', 'unauthorized'),
  isIntegrationHostnameInvalid: equal('integrationStatus', 'invalid_hostname'),
  isIntegrationDisabled: or('isIntegrationUnauthorized', 'isIntegrationHostnameInvalid'),

  isGHEnterprise: equal('integrationName', GITHUB_ENTERPRISE_INTEGRATION_TYPE),

  hasBetaBadge: computed('isBeta', function() {
    return this.isBeta && !this.isGHEnterprise ? true : false;
  }),

  integrationStatusKey: lookup(
    'integrationName',
    INTEGRATIONS_LOOKUP,
    'organizationIntegrationStatus',
  ),

  integrationItems: INTEGRATIONS_LOOKUP,

  isEnabled: computed('integrationName', function() {
    let isGeneralAvailability = this.isGeneralAvailability;
    let isAdminModeEnabled = AdminMode.isAdmin();
    if (isAdminModeEnabled || isGeneralAvailability) {
      return true;
    } else {
      return false;
    }
  }),

  isInstalled: computed('integrationName', function() {
    return this.get(`organization.${this.integrationStatusKey}`);
  }),

  integrationSettingsRoute: computed('integrationName', function() {
    return `organizations.organization.integrations.${this.routeSlug}`;
  }),

  installButtonText: lookup('integrationName', INTEGRATIONS_LOOKUP, 'installButtonText'),
  buttonText: computed('isInstalled', 'installButtonText', function() {
    if (this.isInstalled) {
      return 'Edit Settings';
    } else {
      return this.installButtonText || 'Install';
    }
  }),

  buttonClasses: computed('isInstalled', function() {
    return this.isInstalled
      ? 'data-test-integration-button-edit btn text-blue-500'
      : 'data-test-integration-button-install btn btn-primary shadow-purple-lg m-0';
  }),

  actions: {
    showSupport() {
      const messageText =
        "Hi! I'd like to edit the details of our " + `${this.textName} integration.`;

      this.intercom.showIntercom('showNewMessage', messageText);
    },

    installButtonAction() {
      if (this.customInstallButtonAction) {
        this.customInstallButtonAction();
      } else {
        this.router.transitionTo(this.integrationSettingsRoute, this.orgSlug);
      }
    },
  },
});
