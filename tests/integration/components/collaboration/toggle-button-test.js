import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import {render, click} from '@ember/test-helpers';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';

describe('Integration: CollaborationToggleButton', function() {
  setupRenderingTest('collaboration-toggle-button', {
    integration: true,
  });

  let toggleCollaborationPanelStub;

  beforeEach(async function() {
    toggleCollaborationPanelStub = sinon.stub();

    this.setProperties({
      toggleCollaborationPanelStub,
    });
  });

  it('displays purple bubble with count when there are unresolved comments', async function() {
    await render(hbs`<Collaboration::ToggleButton
      @unresolvedCommentThreadCount={{100}}
      @toggleCollaborationPanel={{toggleCollaborationPanelStub}}
    />`);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('displays green check when isResolved is true', async function() {
    await render(hbs`<Collaboration::ToggleButton
      @isResolved={{true}}
      @toggleCollaborationPanel={{toggleCollaborationPanelStub}}
    />`);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('displays grey icon with plus button when isResolved is false and there are no comments', async function() { // eslint-disable-line
    await render(hbs`<Collaboration::ToggleButton
      @isResolved={{false}}
      @toggleCollaborationPanel={{toggleCollaborationPanelStub}}
    />`);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('calls toggle action when clicked', async function() {
    await render(hbs`<Collaboration::ToggleButton
      @toggleCollaborationPanel={{toggleCollaborationPanelStub}}
    />`);
    await click('[data-test-toggle-comment-sidebar]');
    expect(toggleCollaborationPanelStub).to.have.been.called;
  });
});
