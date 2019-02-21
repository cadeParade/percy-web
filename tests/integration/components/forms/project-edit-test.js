import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import ProjectEditForm from 'percy-web/tests/pages/components/forms/project-edit';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {percySnapshot} from 'ember-percy';
import {setupRenderingTest} from 'ember-mocha';

describe('Integration: ProjectEditForm', function() {
  setupRenderingTest('forms/project-edit', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    ProjectEditForm.setContext(this);
  });

  describe('publicly viewable checkbox', function() {
    let project;
    beforeEach(async function() {
      project = make('project');
      this.setProperties({project});
      await this.render(hbs`{{forms/project-edit
        project=project
      }}`);
    });

    it('shows as not-checked when publiclyReadable is false', async function() {
      expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(false);
      expect(ProjectEditForm.isPublicCheckboxDisabled).to.equal(false);
      await percySnapshot(this.test.fullTitle());
    });

    it('shows as checked when publiclyReadable is true', async function() {
      const project = make('project', 'public');
      this.set('project', project);

      expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(true);
      expect(ProjectEditForm.isPublicCheckboxDisabled).to.equal(false);
      await percySnapshot(this.test.fullTitle());
    });

    it('toggles switch when clicked', async function() {
      expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(false);
      await ProjectEditForm.togglePublicCheckbox();
      expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(true);
      await ProjectEditForm.togglePublicCheckbox();
      expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(false);
    });

    describe('when project belongs to an organization with a sponsored plan', function() {
      beforeEach(function() {
        const organization = make('organization', 'withSponsoredPlan');
        const project = make('project', 'public', {organization});
        this.set('project', project);
      });

      it('is disabled', async function() {
        expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(true);
        expect(ProjectEditForm.isPublicCheckboxDisabled).to.equal(true);
        await percySnapshot(this.test.fullTitle());
      });

      it('does not toggle switch when clicked', async function() {
        expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(true);
        await ProjectEditForm.togglePublicCheckbox();
        expect(ProjectEditForm.isPublicCheckboxChecked).to.equal(true);
      });
    });
  });
});
