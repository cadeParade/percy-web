import AdminMode from 'percy-web/lib/admin-mode';
import RepoLinkerList from 'percy-web/tests/pages/components/organizations/repo-linker-list';
import hbs from 'htmlbars-inline-precompile';
import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import percySnapshot from '@percy/ember';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';

describe('Integration: RepoLinkerList', function () {
  setupRenderingTest('repo-linker-list', {
    integration: true,
  });

  beforeEach(async function () {
    AdminMode.setAdminMode();
    setupFactoryGuy(this);

    const linkedProject = make('project', 'withGithubRepo');
    const unlinkedProject = make('project');

    const organization = make('organization', {projects: [linkedProject, unlinkedProject]});
    this.set('organization', organization);

    await render(hbs`<Organizations::Integrations::RepoLinkerList
      @organization={{organization}}
    />`);
  });

  it('renders a list of items', async function () {
    expect(RepoLinkerList.isListHeaderVisible).to.eq(true);
    expect(RepoLinkerList.listItems.length).to.eq(2);
    await percySnapshot(this.test);
  });

  it('shows some of those items as linked', function () {
    const linkedItem = RepoLinkerList.listItems.filterBy('isLinked');
    expect(linkedItem.length).to.eq(1);
    expect(linkedItem[0].isLinked).to.eq(true);
  });
});
