import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {render} from '@ember/test-helpers';
import BrowserFamilySelector from 'percy-web/tests/pages/components/projects/browser-family-selector'; // eslint-disable-line
import moment from 'moment';
import percySnapshot from '@percy/ember';
import freezeMoment from 'percy-web/tests/helpers/freeze-moment';

describe('Integration: BrowserFamilySelector', function() {
  freezeMoment('2020-01-01');
  setupRenderingTest('projects/browser-family-selector', {
    integration: true,
  });

  let chromeBrowserTarget;
  let firefoxBrowserTarget;
  let project;

  beforeEach(function() {
    setupFactoryGuy(this);
  });

  describe('display', function() {
    beforeEach(function() {
      const firefoxBrowserFamily = make('browser-family', 'firefox');
      const chromeBrowserFamily = make('browser-family', 'chrome');
      project = make('project');
      chromeBrowserTarget = make('browser-target', 'withChromeBrowserFamily');
      firefoxBrowserTarget = make('browser-target', 'withFirefoxBrowserFamily');

      const allBrowserFamilies = [chromeBrowserFamily, firefoxBrowserFamily];
      const stub = sinon.stub();

      this.setProperties({
        project,
        allBrowserFamilies,
        stub,
      });
    });

    describe('enabled/disabled', function() {
      it('shows chrome as selected when project has chrome browser_target', async function() {
        make('project-browser-target', {
          project,
          browserTarget: chromeBrowserTarget,
        });

        await render(hbs`<Projects::BrowserFamilySelector
          @allBrowserFamilies={{allBrowserFamilies}}
          @project={{project}}
        />`);

        expect(BrowserFamilySelector.chromeButton.isActive).to.equal(true);
        expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(false);
      });

      it('shows firefox as selected when project has firefox browser target', async function() {
        make('project-browser-target', {
          project,
          browserTarget: firefoxBrowserTarget,
        });

        await render(hbs`<Projects::BrowserFamilySelector
          @allBrowserFamilies={{allBrowserFamilies}}
          @project={{project}}
        />`);

        expect(BrowserFamilySelector.chromeButton.isActive).to.equal(false);
        expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(true);
      });

      it('shows both browsers as selected when project has both browser targets', async function() {
        make('project-browser-target', {
          project,
          browserTarget: chromeBrowserTarget,
        });
        make('project-browser-target', {
          project,
          browserTarget: firefoxBrowserTarget,
        });
        await render(hbs`<Projects::BrowserFamilySelector
          @allBrowserFamilies={{allBrowserFamilies}}
          @project={{project}}
        />`);

        expect(BrowserFamilySelector.chromeButton.isActive).to.equal(true);
        expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(true);
      });
    });

    describe('upgrading', function() {
      describe('when all browsers are enabled', function() {
        it('shows upgrade button on chrome when only chrome is upgradeable', async function() {
          const projectBrowserTargets = [
            make('project-browser-target', 'upgradeable', {
              project,
              browserTarget: chromeBrowserTarget,
            }),
            make('project-browser-target', {project, browserTarget: firefoxBrowserTarget}),
          ];

          this.setProperties({projectBrowserTargets});
          await render(hbs`<Projects::BrowserFamilySelector
            @allBrowserFamilies={{allBrowserFamilies}}
            @project={{project}}
          />`);

          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(false);
        });

        it('shows upgrade button on firefox when only firefox is upgradeable', async function() {
          const projectBrowserTargets = [
            make('project-browser-target', {project, browserTarget: chromeBrowserTarget}),
            make('project-browser-target', 'upgradeable', {
              project,
              browserTarget: firefoxBrowserTarget,
            }),
          ];
          this.setProperties({projectBrowserTargets});
          await render(hbs`<Projects::BrowserFamilySelector
            @allBrowserFamilies={{allBrowserFamilies}}
            @project={{project}}
          />`);

          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(false);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(true);
        });

        it('shows upgrade button on both when both are upgradeable', async function() {
          const projectBrowserTargets = [
            make('project-browser-target', 'upgradeable', {
              project,
              browserTarget: chromeBrowserTarget,
            }),
            make('project-browser-target', 'upgradeable', {
              project,
              browserTarget: firefoxBrowserTarget,
            }),
          ];
          this.setProperties({projectBrowserTargets});
          await render(hbs`<Projects::BrowserFamilySelector
            @allBrowserFamilies={{allBrowserFamilies}}
            @project={{project}}
          />`);

          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(true);
        });

        it('shows update period when a browser is set to be deprecated', async function() {
          const pbtWithDeprecation = make('project-browser-target', 'upgradeable', {
            project,
            browserTarget: make(
              'browser-target',
              'withFirefoxBrowserFamily',
              'withDeprecationPeriod',
            ),
          });

          const projectBrowserTargets = [
            make('project-browser-target', {project, browserTarget: chromeBrowserTarget}),
            pbtWithDeprecation,
          ];
          this.setProperties({projectBrowserTargets});
          await render(hbs`<Projects::BrowserFamilySelector
            @allBrowserFamilies={{allBrowserFamilies}}
            @project={{project}}
            @areAnyBrowsersUpgradeable=true
          />`);

          await percySnapshot(this.test.fullTitle());

          expect(BrowserFamilySelector.hasChromeUpdatePeriod).to.equal(false);
          expect(BrowserFamilySelector.hasFirefoxUpdatePeriod).to.equal(true);

          const target = pbtWithDeprecation.browserTarget;
          expect(BrowserFamilySelector.firefoxUpdatePeriod).to.equal(
            `${target.browserFamily.name}: ` +
              `${moment(target.deprecationPeriodStart).format('MMMM D')} and ` +
              `${moment(target.deprecationPeriodEnd).format('MMMM D, YYYY')}`,
          );
        });
      });

      describe('when not all browsers are enabled', function() {
        it('shows upgrade button on enabled browser when it is upgradeable', async function() {
          const projectBrowserTargets = [
            make('project-browser-target', 'upgradeable', {
              project,
              browserTarget: chromeBrowserTarget,
            }),
          ];

          this.setProperties({projectBrowserTargets});
          await render(hbs`<Projects::BrowserFamilySelector
            @allBrowserFamilies={{allBrowserFamilies}}
            @project={{project}}
          />`);

          expect(BrowserFamilySelector.chromeButton.isActive).to.equal(true);
          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
          expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(false);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(false);
        });
      });
    });
  });
});
