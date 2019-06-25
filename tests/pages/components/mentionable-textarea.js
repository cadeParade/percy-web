import {collection, create, hasClass, text, value} from 'ember-cli-page-object';
import {triggerKeyEvent, typeIn, waitFor, find} from '@ember/test-helpers';
import {assert} from '@ember/debug';

const SELECTORS = {
  SCOPE: '[data-test-mentionable-textarea]',
  MENTION_LIST_CONTAINER: '.tribute-container',
  MENTIONABLE_ITEM: '.tribute-container li',
};

export const mentionableTextarea = {
  scope: SELECTORS.SCOPE,

  async triggerMentionList(inputSelector) {
    await typeIn(inputSelector || 'textarea', '@');
    await waitFor(SELECTORS.MENTION_LIST_CONTAINER);
    const tributeContainer = find(SELECTORS.MENTION_LIST_CONTAINER);
    tributeContainer.style.cssText = 'top: 100px; bottom: 0; left:0';
  },

  async keyboardSelectNextUser(inputSelector) {
    await triggerKeyEvent(inputSelector || 'textarea', 'keydown', 40);
    await triggerKeyEvent(inputSelector || 'textarea', 'keyup', 40);
  },

  async keyboardSelectUser(inputSelector) {
    await triggerKeyEvent(inputSelector || 'textarea', 'keydown', 13);
    await triggerKeyEvent(inputSelector || 'textarea', 'keyup', 13);
  },

  async selectUserAtIndex(index, inputSelector) {
    await this.triggerMentionList(inputSelector);
    assert("Trying to select user that doesn't exist", index <= this.mentionableItems.length - 1);
    for (var i = 0; i < index; i++) {
      await this.keyboardSelectNextUser(inputSelector);
    }
    await this.keyboardSelectUser(inputSelector);
  },

  async selectFirstUser(inputSelector) {
    await this.selectUserAtIndex(0, inputSelector);
  },

  async selectSecondUser(inputSelector) {
    await this.selectUserAtIndex(1, inputSelector);
  },

  mentionList: {
    scope: SELECTORS.MENTION_LIST_CONTAINER,
    testContainer: '#ember-testing-container',
    resetScope: true,
  },

  mentionableItems: collection(SELECTORS.MENTIONABLE_ITEM, {
    testContainer: '#ember-testing-container',
    resetScope: true,

    isSelected: hasClass('highlight'),
    name: text(),
  }),

  textareaValue: value('textarea'),
};

export default create(mentionableTextarea);
