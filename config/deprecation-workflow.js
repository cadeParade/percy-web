window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    {handler: 'silence', matchId: 'ember-simple-auth.session.authorize'},
    {handler: 'silence', matchId: 'ember-simple-auth.baseAuthorizer'},
    {handler: 'silence', matchId: 'ember-simple-auth-auth0.jwtAuthorizer'},
    {handler: 'silence', matchId: 'ember-font-awesome.no-fa-prefix'},
    // ember 3.8 upgrade
    {handler: 'silence', matchId: 'remove-handler-infos'}, // until ember-source 3.9
    // ember-mocha 0.16.0 upgrade until ember-mocha 2.0
    // (caused by ember-page-object https://bit.ly/2KETufx)
    {handler: 'silence', matchId: 'ember-test-helpers.rendering-context.jquery-element'},
  ],
};

// While not deprecations, we have also skipped the following warnings:
// ds.store.findRecord.id-mismatch,
// ds.store.push-link-for-sync-relationship
// in a registerWarnHelper method in app.js
// These warnings are related to the json api violation that is using slugs rather than ids
// to send information back and forth between api and client. Removing these warnings would
// require a large refactor to use ids rather than slugs in both the api and client and so
// we are just hiding them for now.
