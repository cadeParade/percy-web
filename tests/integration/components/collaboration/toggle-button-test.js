import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import {click} from '@ember/test-helpers';
import {percySnapshot} from 'ember-percy';

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
    await this.render(hbs`{{collaboration/toggle-button
      unresolvedCommentAmount=100
      toggleCollaborationPanel=toggleCollaborationPanelStub
    }}`);
    await percySnapshot(this.test);
  });

  it('displays green check when isResolved is true', async function() {
    await this.render(hbs`{{collaboration/toggle-button
      isResolved=true
      toggleCollaborationPanel=toggleCollaborationPanelStub
    }}`);
    await percySnapshot(this.test);
  });

  it('displays grey icon with plus button when isResolved is false and there are no comments', async function() { // eslint-disable-line
    await this.render(hbs`{{collaboration/toggle-button
      isResolved=false
      toggleCollaborationPanel=toggleCollaborationPanelStub
    }}`);
    await percySnapshot(this.test);
  });

  it('calls toggle action when clicked', async function() {
    await this.render(hbs`{{collaboration/toggle-button
      toggleCollaborationPanel=toggleCollaborationPanelStub
    }}`);
    await click('[data-test-toggle-comment-sidebar]');
    expect(toggleCollaborationPanelStub).to.have.been.called;
  });
});
