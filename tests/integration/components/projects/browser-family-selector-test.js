import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {render} from '@ember/test-helpers';
import BrowserFamilySelector from 'percy-web/tests/pages/components/projects/browser-family-selector'; // eslint-disable-line

describe('Integration: BrowserFamilySelector', function() {
  setupRenderingTest('projects/browser-family-selector', {
    integration: true,
  });

  let chromeBrowserTarget;
  let firefoxBrowserTarget;
  let project;

  beforeEach(function() {
    setupFactoryGuy(this);
    BrowserFamilySelector.setContext(this);
  });

  describe('display', function() {
    beforeEach(function() {
      const firefoxBrowserFamily = make('browser-family');
      const chromeBrowserFamily = make('browser-family', 'chrome');
      project = make('project');
      chromeBrowserTarget = make('browser-target', {browserFamily: chromeBrowserFamily});
      firefoxBrowserTarget = make('browser-target', {browserFamily: firefoxBrowserFamily});

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

        await render(hbs`{{projects/browser-family-selector
          allBrowserFamilies=allBrowserFamilies
          project=project
        }}`);

        expect(BrowserFamilySelector.chromeButton.isActive).to.equal(true);
        expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(false);
      });

      it('shows firefox as selected when project has firefox browser target', async function() {
        make('project-browser-target', {
          project,
          browserTarget: firefoxBrowserTarget,
        });

        await render(hbs`{{projects/browser-family-selector
          allBrowserFamilies=allBrowserFamilies
          project=project
        }}`);

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
        await render(hbs`{{projects/browser-family-selector
          allBrowserFamilies=allBrowserFamilies
          project=project
        }}`);

        expect(BrowserFamilySelector.chromeButton.isActive).to.equal(true);
        expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(true);
      });
    });

    describe('upgrading', function() {
      function makeUpgradeableProjectBrowserTarget(family) {
        return make('project-browser-target', 'upgradeable', {
          project,
          browserTarget: family === 'chrome' ? chromeBrowserTarget : firefoxBrowserTarget,
        });
      }

      function makeRecentProjectBrowserTarget(family) {
        return make('project-browser-target', {
          project,
          browserTarget: family === 'chrome' ? chromeBrowserTarget : firefoxBrowserTarget,
        });
      }

      describe('when all browsers are enabled', function() {
        it('shows upgrade button on chrome when only chrome is upgradeable', async function() {
          const projectBrowserTargets = [
            makeUpgradeableProjectBrowserTarget('chrome'),
            makeRecentProjectBrowserTarget('firefox'),
          ];
          this.setProperties({projectBrowserTargets});
          await render(hbs`{{projects/browser-family-selector
            allBrowserFamilies=allBrowserFamilies
            project=project
          }}`);
          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(false);
        });

        it('shows upgrade button on firefox when only firefox is upgradeable', async function() {
          const projectBrowserTargets = [
            makeRecentProjectBrowserTarget('chrome'),
            makeUpgradeableProjectBrowserTarget('firefox'),
          ];
          this.setProperties({projectBrowserTargets});
          await render(hbs`{{projects/browser-family-selector
            allBrowserFamilies=allBrowserFamilies
            project=project
          }}`);

          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(false);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(true);
        });

        it('shows upgrade button on both when both are upgradeable', async function() {
          const projectBrowserTargets = [
            makeUpgradeableProjectBrowserTarget('chrome'),
            makeUpgradeableProjectBrowserTarget('firefox'),
          ];
          this.setProperties({projectBrowserTargets});
          await render(hbs`{{projects/browser-family-selector
            allBrowserFamilies=allBrowserFamilies
            project=project
          }}`);

          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(true);
        });
      });

      describe('when not all browsers are enabled', function() {
        it('shows upgrade button on enabled browser when it is upgradeable', async function() {
          const projectBrowserTargets = [makeUpgradeableProjectBrowserTarget('chrome')];

          this.setProperties({projectBrowserTargets});
          await render(hbs`{{projects/browser-family-selector
            allBrowserFamilies=allBrowserFamilies
            project=project
          }}`);

          expect(BrowserFamilySelector.chromeButton.isActive).to.equal(true);
          expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
          expect(BrowserFamilySelector.firefoxButton.isActive).to.equal(false);
          expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(false);
        });
      });

      describe('with feature flag on to prevent members from upgrading', function() {
        describe('as a member', function() {
          it('does not show an upgrade button when both are upgradeable', async function() {
            const projectBrowserTargets = [
              makeUpgradeableProjectBrowserTarget('chrome'),
              makeUpgradeableProjectBrowserTarget('firefox'),
            ];
            this.setProperties({projectBrowserTargets});
            await render(hbs`{{projects/browser-family-selector
              allBrowserFamilies=allBrowserFamilies
              project=project
              isUpgradeAllowed=false
            }}`);

            expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(false);
            expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(false);
          });
        });
        describe('as an admin', function() {
          it('shows upgrade button on both browsers when both are upgradeable', async function() {
            const projectBrowserTargets = [
              makeUpgradeableProjectBrowserTarget('chrome'),
              makeUpgradeableProjectBrowserTarget('firefox'),
            ];
            this.setProperties({projectBrowserTargets});
            await render(hbs`{{projects/browser-family-selector
              allBrowserFamilies=allBrowserFamilies
              project=project
            }}`);

            expect(BrowserFamilySelector.chromeButton.isUpgradeable).to.equal(true);
            expect(BrowserFamilySelector.firefoxButton.isUpgradeable).to.equal(true);
          });
        });
      });
    });
  });
});
