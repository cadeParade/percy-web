import {clickTrigger} from 'ember-basic-dropdown/test-support/helpers';
import {resolve} from 'rsvp';

const CONTENT_SELECTOR = 'ember-basic-dropdown-content';

export default async function clickDropdownTrigger(selector, styleAttrs) {
  const dropdownAlreadyOpen = document.getElementsByClassName(CONTENT_SELECTOR)[0];
  if (dropdownAlreadyOpen) {
    return await clickTrigger(selector);
  } else {
    // Dropdown content panel is positioned offscreen due to how the addon
    // calculates its positioning. Move the dropdown to on screen and to approximately
    // the right position so we can take percy snapshots.
    await clickTrigger(selector);

    const content = document.getElementsByClassName(CONTENT_SELECTOR)[0];

    content.style.cssText = _serializeStyleAttrs(styleAttrs);
    return resolve();
  }
}

function _serializeStyleAttrs(styleAttrs) {
  styleAttrs = styleAttrs || {
    top: '48px',
    right: '60px',
  };

  let serializedAttrs = '';
  for (const key of Object.keys(styleAttrs)) {
    serializedAttrs = serializedAttrs + `${key}: ${styleAttrs[key]};`;
  }
  return serializedAttrs;
}
