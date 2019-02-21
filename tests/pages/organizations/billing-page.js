import {visitable, create} from 'ember-cli-page-object';

const BillingPage = {
  visitBillingPage: visitable('/organizations/:orgSlug/billing'),
};

export default create(BillingPage);
