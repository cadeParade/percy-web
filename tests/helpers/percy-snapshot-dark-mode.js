import {percySnapshot} from 'ember-percy';

const DARK_MODE_CLASS_NAME = 'theme-dark';

export async function percySnapshotWithDarkMode(rawName, options) {
  let name = processName(rawName);
  let lightResult = await percySnapshot(name, options);

  document.body.classList.add(DARK_MODE_CLASS_NAME);
  let darkResult = await percySnapshot('Dark' + name, options);
  document.body.classList.remove(DARK_MODE_CLASS_NAME);

  return lightResult && darkResult;
}

function processName(name) {
  // Automatic name generation for QUnit tests by passing in the `assert` object.
  if (name.test && name.test.module && name.test.module.name && name.test.testName) {
    name = `${name.test.module.name} | ${name.test.testName}`;
  } else if (name.fullTitle) {
    // Automatic name generation for Mocha tests by passing in the `this.test` object.
    name = name.fullTitle();
  }
  return name;
}
