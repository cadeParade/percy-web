import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {makeList} from 'ember-data-factory-guy';
import {click, typeIn, findAll, render} from '@ember/test-helpers';
import MentionableTextarea from 'percy-web/tests/pages/components/mentionable-textarea';
import percySnapshot from '@percy/ember';
import sinon from 'sinon';
import {
  generateTributeUserConfig,
  generateTributeEmojiConfig,
} from 'percy-web/services/mentionables';
import emojis from 'percy-web/lib/emoji';

describe('Integration: MentionableTextarea', function() {
  setupRenderingTest('mentionable-textarea', {
    integration: true,
  });

  let handleItemSelectedStub;
  const numUsers = 10;

  beforeEach(async function() {
    setupFactoryGuy(this);

    const mentionableUsers = makeList('user', numUsers);
    const collections = [
      generateTributeUserConfig((text, cb) => cb(mentionableUsers)),
      generateTributeEmojiConfig((text, cb) => cb(emojis)),
    ];
    handleItemSelectedStub = sinon.stub();

    this.setProperties({
      mentionableUsers,
      tributeConfigs: collections,
      handleItemSelected: handleItemSelectedStub,
    });

    await render(hbs`
      {{#mentionable-textarea
        tributeConfigs=tributeConfigs
        handleItemSelected=(action handleItemSelected)
      }}
        {{percy-textarea}}
      {{/mentionable-textarea}}
      `);
  });

  it('displays mention menu when `@` is typed', async function() {
    expect(MentionableTextarea.mentionList.isVisible).to.equal(false);
    await MentionableTextarea.triggerMentionList();
    expect(MentionableTextarea.mentionList.isVisible).to.equal(true);
    expect(MentionableTextarea.mentionableItems.length).to.equal(numUsers);
    await percySnapshot(this.test);
  });

  it('displays emoji menu when `:` is typed', async function() {
    expect(MentionableTextarea.mentionList.isVisible).to.equal(false);
    await MentionableTextarea.triggerEmojiList();
    expect(MentionableTextarea.mentionList.isVisible).to.equal(true);
    await percySnapshot(this.test);
  });

  it('selects item with keyboard', async function() {
    await MentionableTextarea.triggerMentionList();
    await MentionableTextarea.keyboardSelectNextUser();
    await MentionableTextarea.keyboardSelectNextUser();

    const thirdUser = MentionableTextarea.mentionableItems[2];
    expect(thirdUser.isSelected).to.equal(true);
    await percySnapshot(this.test.fullTitle() + ' | pressing down with keyboard');
  });

  it('selects item with click', async function() {
    await MentionableTextarea.triggerMentionList();
    const sixthUserName = MentionableTextarea.mentionableItems[5].name;
    const items = findAll(MentionableTextarea.mentionableItems.scope);
    await click(items[5]);

    expect(MentionableTextarea.mentionList.isVisible).to.equal(false);
    expect(MentionableTextarea.textareaValue).to.include(`@${sixthUserName}`);
  });

  it('filters user list based on name', async function() {
    await MentionableTextarea.triggerMentionList();
    const fourthUserName = MentionableTextarea.mentionableItems[3].name;
    const lastThreeLetters = fourthUserName.slice(fourthUserName.length - 3);

    await typeIn('textarea', lastThreeLetters);
    expect(MentionableTextarea.mentionableItems.length < 10).to.equal(true);
    await percySnapshot(this.test.fullTitle() + ' | item is selected');
  });

  it('fires `handleItemSelected` action when an item is selected', async function() {
    await MentionableTextarea.selectFirstUser();

    expect(handleItemSelectedStub).to.have.been.calledWith(this.mentionableUsers[0]);
  });
});
