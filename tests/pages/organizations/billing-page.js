import {visitable, create} from 'ember-cli-page-object';
import {DashboardNav} from 'percy-web/tests/pages/components/dashboard-nav';
import {BillingSection} from 'percy-web/tests/pages/components/organizations/billing-section';
import {alias} from 'ember-cli-page-object/macros';

const BillingPage = {
  nav: DashboardNav,
  visitOrgSettings: visitable('/organizations/:orgSlug/settings'),
  visitBillingPage: visitable('/organizations/:orgSlug/billing'),
  billingSection: BillingSection,
  billingSettings: alias('billingSection.billingSettings'),
  subscriptionList: alias('billingSection.billingSettings.subscriptionList'),
  billingEditForm: alias('billingSection.billingSettings.billingEditForm'),
};

export default create(BillingPage);
