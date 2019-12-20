import percySnapshotOg from '@percy/ember';

const DARK_MODE_CLASS_NAME = 'theme-dark';

export default async function percySnapshot(name, options = {}) {
  if (options.darkMode) {
    document.body.classList.add(DARK_MODE_CLASS_NAME);
    await percySnapshotOg(processName(name), options);
    document.body.classList.remove(DARK_MODE_CLASS_NAME);

    return;
  }

  return await percySnapshotOg(name, options);
}

// Prepends "Dark" in front of the normal auto name gen we do
function processName(name) {
  // Automatic name generation for QUnit tests by passing in the `assert` object.
  if (name.test && name.test.module && name.test.module.name && name.test.testName) {
    return `Dark${name.test.module.name} | ${name.test.testName}`;
  } else if (name.fullTitle) {
    // Automatic name generation for Mocha tests by passing in the `this.test` object.
    return `Dark${name.fullTitle()}`;
  } else {
    return `Dark ${name}`;
  }
}
