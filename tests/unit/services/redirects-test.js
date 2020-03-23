import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {setupTest} from 'ember-mocha';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import localStorageProxy from 'percy-web/lib/localstorage';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';
import {resolve} from 'rsvp';

describe('RedirectsService', function () {
  setupTest();
  SetupLocalStorageSandbox();

  let service;
  let routerStub;
  let replaceWithStub;
  let transitionToStub;

  beforeEach(async function () {
    localStorage.clear();
    setupFactoryGuy(this);
    replaceWithStub = sinon.stub();
    transitionToStub = sinon.stub();
    routerStub = {
      replaceWith: replaceWithStub,
      transitionTo: transitionToStub,
    };
    service = this.owner.factoryFor('service:redirects').create({router: routerStub});
  });

  describe('redirectToRecentProjectForOrg', function () {
    const recentProjectSlug = 'recent-project';
    const orgSlug = 'org-slug';

    describe('when there is a recentProjectSlug', function () {
      beforeEach(async function () {
        localStorageProxy.set('recentProjectSlugs', {[orgSlug]: recentProjectSlug});
      });

      it('transitions to project when the project belongs to the organization', async function () {
        const projects = [make('project', {slug: recentProjectSlug})];
        const org = _constructOrgObject(orgSlug, projects);
        await service.redirectToRecentProjectForOrg(org);
        expect(transitionToStub).to.have.been.calledWith(
          'organization.project.index',
          orgSlug,
          recentProjectSlug,
        );
      });

      it('transitions to default project for org when recent project slug is not in org', async function() { // eslint-disable-line
        const defaultProjectSlug = 'default-project-for-org';
        const defaultProjectForOrg = make('project', {slug: defaultProjectSlug});
        const disabledProject = make('project', {isEnabled: false});
        const newProject = {id: null};
        const projects = [disabledProject, newProject, defaultProjectForOrg];
        const org = _constructOrgObject(orgSlug, projects);
        await service.redirectToRecentProjectForOrg(org);
        expect(transitionToStub).to.have.been.calledWith(
          'organization.project.index',
          orgSlug,
          defaultProjectSlug,
        );
      });
    });

    describe('when there is not a recentProjectSlug', function () {
      describe('when there are no projects in the org', function () {
        it('transitions to new project page', async function () {
          const org = _constructOrgObject(orgSlug, []);
          await service.redirectToRecentProjectForOrg(org);
          _expectTransitionToNewProject(orgSlug);
        });
      });

      describe("when the org's only project does not have an id", function () {
        it('transitionsTo new project page', async function () {
          const project = {id: null};
          const org = _constructOrgObject(orgSlug, [project]);
          await service.redirectToRecentProjectForOrg(org);
          _expectTransitionToNewProject(orgSlug);
        });
      });

      describe("when the org's only project is disabled", function () {
        it('transitionsTo new project page', async function () {
          const project = make('project', {isEnabled: false});
          const org = _constructOrgObject(orgSlug, [project]);
          await service.redirectToRecentProjectForOrg(org);
          _expectTransitionToNewProject(orgSlug);
        });
      });
    });

    describe('when goToSettings is true', function () {
      let org;
      beforeEach(async function () {
        localStorageProxy.set('recentProjectSlugs', {[orgSlug]: recentProjectSlug});
        const projects = [make('project', {slug: recentProjectSlug})];
        org = _constructOrgObject(orgSlug, projects);
      });

      it('redirects to project settings page', async function () {
        await service.redirectToRecentProjectForOrg(org, {goToSettings: true});
        return expect(transitionToStub).to.have.been.calledWith(
          'organization.project.settings',
          orgSlug,
          recentProjectSlug,
        );
      });
    });
  });

  function _expectTransitionToNewProject(orgSlug) {
    return expect(transitionToStub).to.have.been.calledWith(
      'organizations.organization.projects.new',
      orgSlug,
    );
  }

  // The `reload` method called on org.get('projects') makes this really hard to stub with plain
  // factoryGuy objects, so construct an arbitrary object to deal with the server requests :/
  function _constructOrgObject(orgSlug, projects) {
    const org = {
      slug: orgSlug,
      projects: {
        reload: sinon.stub().returns(resolve(projects)),
      },
    };
    return org;
  }
});
