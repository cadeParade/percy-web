import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import {initialize as initializeEmberKeyboard} from 'ember-keyboard';
import PercyTextarea from 'percy-web/tests/pages/components/percy-textarea';

describe('Integration: PercyTextarea', function() {
  setupRenderingTest('percy-textarea', {
    integration: true,
  });

  let onCmdEnterStub;
  let onEscStub;
  beforeEach(async function() {
    initializeEmberKeyboard();
    PercyTextarea.setContext(this);

    onCmdEnterStub = sinon.stub();
    onEscStub = sinon.stub();

    this.setProperties({onCmdEnterStub, onEscStub});

    await this.render(hbs`{{percy-textarea
        onCmdEnter=onCmdEnterStub
        onEscape=onEscStub
      }}`);
  });

  it('calls cmdEnter stub when cmd+Enter is pushed', async function() {
    await PercyTextarea.cmdEnter();
    expect(onCmdEnterStub).to.have.been.called;
  });

  it('calls onEsc stub when Escape is pushed', async function() {
    await PercyTextarea.escape();
    expect(onEscStub).to.have.been.called;
  });
});
