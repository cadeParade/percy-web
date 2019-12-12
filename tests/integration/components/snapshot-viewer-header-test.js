/* jshint expr:true */
import {setupRenderingTest} from 'ember-mocha';
import {beforeEach, it, describe} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import SnapshotViewerHeaderPO from 'percy-web/tests/pages/components/snapshot-viewer-header';
import sinon from 'sinon';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';

describe('Integration: SnapshotViewerHeader', function() {
  setupRenderingTest('snapshot-viewer-header', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    SnapshotViewerHeaderPO.setContext(this);
    this.set('browser', make('browser'));
  });

  describe('dropdown', function() {
    beforeEach(function() {
      this.set('stub', sinon.stub());
      this.set('snapshot', make('snapshot'));
    });

    it('shows dropdown toggle', async function() {
      await render(hbs`{{snapshot-viewer-header
        snapshot=snapshot
        toggleViewMode=stub
        updateSelectedWidth=stub
        expandSnapshot=stub
        activeBrowser=browser
      }}`);

      expect(SnapshotViewerHeaderPO.isDropdownToggleVisible).to.equal(true);
    });

    it('toggles dropdown pane when dropdown toggle is clicked', async function() {
      await render(hbs`{{snapshot-viewer-header
        snapshot=snapshot
        toggleViewMode=stub
        updateSelectedWidth=stub
        activeBrowser=browser
      }}`);

      expect(SnapshotViewerHeaderPO.isDropdownPaneVisible).to.equal(false);
      await SnapshotViewerHeaderPO.clickDropdownToggle();
      expect(SnapshotViewerHeaderPO.isDropdownPaneVisible).to.equal(true);
      await SnapshotViewerHeaderPO.clickDropdownToggle();
      expect(SnapshotViewerHeaderPO.isDropdownPaneVisible).to.equal(false);
    });

    it('shows copy url option', async function() {
      await render(hbs`{{snapshot-viewer-header
        snapshot=snapshot
        toggleViewMode=stub
        updateSelectedWidth=stub
        activeBrowser=browser
      }}`);

      await SnapshotViewerHeaderPO.clickDropdownToggle();
      expect(SnapshotViewerHeaderPO.dropdownOptions.objectAt(0).text).to.equal('Copy snapshot URL');
      await percySnapshot(this.test, { darkMode: true });
    });

    describe('download HTML options', function() {
      let comparison;
      let baseSnapshot;
      let headSnapshot;
      beforeEach(async function() {
        comparison = make('comparison');
        baseSnapshot = make('snapshot');
        headSnapshot = make('snapshot');
        this.set('comparison', comparison);
        this.set('snapshot', make('snapshot'));

        await render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
          selectedComparison=comparison
          activeBrowser=browser
        }}`);
      });

      it('shows download original and new source option', async function() {
        this.set('comparison.headSnapshot', headSnapshot);
        this.set('comparison.baseSnapshot', baseSnapshot);

        await SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.dropdownOptions.objectAt(1).text).to.equal(
          'Download original source',
        );
        expect(SnapshotViewerHeaderPO.dropdownOptions.objectAt(2).text).to.equal(
          'Download new source',
        );
        await percySnapshot(this.test, { darkMode: true });
      });

      it('shows download new source option', async function() {
        this.set('comparison.headSnapshot', headSnapshot);

        await SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.dropdownOptions.objectAt(1).text).to.equal(
          'Download new source',
        );
        await percySnapshot(this.test, { darkMode: true });
      });
    });

    describe('download source diff', function() {
      let comparison;
      let baseSnapshot;
      let headSnapshot;

      describe('When a snapshot comparison has a visual diff', function() {
        beforeEach(async function() {
          comparison = make('comparison');
          baseSnapshot = make('snapshot');
          headSnapshot = make('snapshot');
          this.set('comparison', comparison);
          this.set('snapshot', headSnapshot);
          this.set('comparison.baseSnapshot', baseSnapshot);
          this.set('comparison.headSnapshot', headSnapshot);

          await render(hbs`{{snapshot-viewer-header
            snapshot=snapshot
            toggleViewMode=stub
            updateSelectedWidth=stub
            selectedComparison=comparison
            activeBrowser=browser
          }}`);
        });

        it('shows download source diff', async function() {
          await SnapshotViewerHeaderPO.clickDropdownToggle();

          expect(
            SnapshotViewerHeaderPO.dropdownOptions.mapBy('text').includes('Download source diff'),
          ).to.be.true;
          await percySnapshot(this.test, { darkMode: true });
        });
      });

      describe('When a shapshot comparison has no visual diff', function() {
        beforeEach(async function() {
          comparison = make('comparison');
          baseSnapshot = make('snapshot', 'withNoDiffs');
          headSnapshot = make('snapshot', 'withNoDiffs');
          this.set('comparison', comparison);
          this.set('snapshot', headSnapshot);
          this.set('comparison.baseSnapshot', headSnapshot);
          this.set('comparison.headSnapshot', headSnapshot);

          await render(hbs`{{snapshot-viewer-header
            snapshot=snapshot
            toggleViewMode=stub
            updateSelectedWidth=stub
            selectedComparison=comparison
            activeBrowser=browser
          }}`);
        });

        it('shows download source diff', async function() {
          await SnapshotViewerHeaderPO.clickDropdownToggle();
          expect(
            SnapshotViewerHeaderPO.dropdownOptions.mapBy('text').includes('Download source diff'),
          ).to.be.true;
          await percySnapshot(this.test, { darkMode: true });
        });
      });

      describe('When a head snapshot has no base to compare', function() {
        beforeEach(async function() {
          comparison = make('comparison');
          headSnapshot = make('snapshot');
          this.set('comparison', comparison);
          this.set('snapshot', headSnapshot);
          this.set('comparison.headSnapshot', headSnapshot);

          await render(hbs`{{snapshot-viewer-header
            snapshot=snapshot
            toggleViewMode=stub
            updateSelectedWidth=stub
            selectedComparison=comparison
            activeBrowser=browser
          }}`);
        });

        it('does not show download source diff', async function() {
          await SnapshotViewerHeaderPO.clickDropdownToggle();
          expect(
            SnapshotViewerHeaderPO.dropdownOptions.mapBy('text').includes('Download source diff'),
          ).to.be.false;
          await percySnapshot(this.test, { darkMode: true });
        });
      });
    });
  });

  describe('comparison width switcher', function() {
    describe('When all comparisons for a snapshot have diffs', function() {
      beforeEach(async function() {
        const snapshot = make('snapshot', 'withComparisons');
        this.set('stub', sinon.stub());
        this.set('snapshot', snapshot);
        await render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
          expandSnapshot=stub
          activeBrowser=browser
        }}`);
      });

      it('displays all comparison widths', function() {
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons.length).to.equal(
          this.get('snapshot.comparisons.length'),
        );
      });

      it('displays correct text on the buttons', function() {
        SnapshotViewerHeaderPO.widthSwitcher.buttons.forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${this.get('snapshot.comparisons')
              .toArray()
              [i].get('width')}px`, // eslint-disable-line
          );
        });
      });

      it('does not display toggle widths option in dropdown', async function() {
        await SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.isToggleWidthsOptionVisible).to.equal(false);
      });
    });

    describe('When some comparisons for a snapshot have diffs', function() {
      let comparisonsWithDiffs;

      beforeEach(async function() {
        const snapshot = make('snapshot', 'withComparisons');
        snapshot.get('comparisons.firstObject').set('diffRatio', 0);

        comparisonsWithDiffs = snapshot.get('comparisons').filterBy('isDifferent');

        this.set('stub', sinon.stub());
        this.set('snapshot', snapshot);
        await render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
          expandSnapshot=stub
          activeBrowser=browser
        }}`);
      });

      it('displays only widths with diffs', function() {
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons.length).to.equal(2);
      });

      it('displays correct text on the buttons', function() {
        SnapshotViewerHeaderPO.widthSwitcher.buttons.forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${comparisonsWithDiffs.toArray()[i].get('width')}px`,
          );
        });
      });

      it('does displays toggle widths option in dropdown', async function() {
        await SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.isToggleWidthsOptionVisible).to.equal(true);
        await percySnapshot(this.test, { darkMode: true });
      });

      it('shows all comparisons widths when toggle widths option is clicked', async function() {
        await SnapshotViewerHeaderPO.clickDropdownToggle();
        await SnapshotViewerHeaderPO.clickToggleAllWidths();
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons.length).to.equal(3);

        SnapshotViewerHeaderPO.widthSwitcher.buttons.forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${this.get('snapshot.comparisons')
              .toArray()
              [i].get('width')}px`, // eslint-disable-line
          );
        });
      });
    });

    describe('When no comparisons for a snapshot have diffs', function() {
      beforeEach(async function() {
        const snapshot = make('snapshot', 'withNoDiffs');

        this.set('stub', sinon.stub());
        this.set('snapshot', snapshot);
        await render(hbs`{{snapshot-viewer-header
          snapshot=snapshot
          toggleViewMode=stub
          updateSelectedWidth=stub
          expandSnapshot=stub
          activeBrowser=browser
        }}`);
      });

      it('displays all widths', function() {
        expect(SnapshotViewerHeaderPO.widthSwitcher.buttons.length).to.equal(
          this.get('snapshot.comparisons.length'),
        );
      });

      it('displays correct text on the buttons', function() {
        SnapshotViewerHeaderPO.widthSwitcher.buttons.forEach((button, i) => {
          expect(button.text, `button ${i} should contain correct width`).to.equal(
            `${this.get('snapshot.comparisons')
              .toArray()
              [i].get('width')}px`, // eslint-disable-line
          );
        });
      });

      it('does not display toggle widths option in dropdown', async function() {
        await SnapshotViewerHeaderPO.clickDropdownToggle();
        expect(SnapshotViewerHeaderPO.isToggleWidthsOptionVisible).to.equal(false);
      });
    });
  });

  describe('snapshot approval badge', function() {
    beforeEach(function() {
      const build = make('build', 'finished');
      const snapshot = make('snapshot', 'withTwoBrowsers', {build});
      const stub = sinon.stub();
      snapshot
        .get('comparisons')
        .filterBy('browser.familySlug', 'chrome')
        .forEach(comparison => {
          comparison.set('diffRatio', 0);
        });

      this.setProperties({
        snapshot,
        stub,
      });
    });

    // eslint-disable-next-line
    it('displays "No changes in [browser]" when there are changes in a different browser', async function() {
      const browser = make('browser', 'chrome');
      this.set('browser', browser);
      await render(hbs`{{snapshot-viewer-header
        snapshot=snapshot
        toggleViewMode=stub
        updateSelectedWidth=stub
        expandSnapshot=stub
        activeBrowser=browser
      }}`);

      expect(SnapshotViewerHeaderPO.snapshotApprovalButton.isNoChangeInBrowserVisible).to.equal(
        true,
      );
      expect(SnapshotViewerHeaderPO.snapshotApprovalButton.isUnapproved).to.equal(false);
    });

    it('displays "Approve" button when there are changes in the active browser', async function() {
      const browser = make('browser');
      this.set('browser', browser);
      await render(hbs`{{snapshot-viewer-header
        snapshot=snapshot
        toggleViewMode=stub
        updateSelectedWidth=stub
        expandSnapshot=stub
        activeBrowser=browser
      }}`);

      expect(SnapshotViewerHeaderPO.snapshotApprovalButton.isNoChangeInBrowserVisible).to.equal(
        false,
      );
      expect(SnapshotViewerHeaderPO.snapshotApprovalButton.isUnapproved).to.equal(true);
    });
  });

  describe('comment button', function() {
    it('displays number of open comment threads', async function() {
      const stub = sinon.stub();
      const openCommentThreads = makeList('comment-thread', 3);
      const snapshot = make('snapshot', 'withFinishedBuild', {openCommentThreads});

      this.setProperties({snapshot, stub, openCommentThreads});

      await render(hbs`{{snapshot-viewer-header
        snapshot=snapshot
        toggleViewMode=stub
        updateSelectedWidth=stub
        expandSnapshot=stub
        activeBrowser=browser
        openCommentThreads=openCommentThreads
        toggleCollaborationPanel=stub
        isBuildApprovable=true
      }}`);

      expect(SnapshotViewerHeaderPO.isToggleCommentSidebarVisible).to.equal(true);
      expect(SnapshotViewerHeaderPO.numOpenCommentThreads).to.equal('3');
    });
  });
});
