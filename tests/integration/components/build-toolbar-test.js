import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import BuildPage from 'percy-web/tests/pages/build-page';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';

describe('Integration: BuildToolbar', function() {
  setupRenderingTest();

  beforeEach(function() {
    setupFactoryGuy(this);
    BuildPage.setContext(this);
  });

  describe('when the project is public', function() {
    beforeEach(function() {
      const organization = make('organization', 'withProjects', {isSponsored: true});
      const project = organization.get('projects.firstObject');
      const build = make('build', {project});
      this.setProperties({
        build,
        project,
        organization,
      });

      render(hbs`{{build-toolbar
        build=build
        project=project
        organization=organization
      }}`);
    });

    it('displays public project icon', function() {
      expect(BuildPage.isPublicProjectIconVisible).to.equal(true);
    });
  });
});
