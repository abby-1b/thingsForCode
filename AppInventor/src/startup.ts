import { Editor } from './editor';
import * as tsCompile from './to_app_inventor/pkg/to_app_inventor';
import {} from './types';

tsCompile.default();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any)['greet'] = tsCompile.greet;

// Make sure we only load this once
if (!window['alreadyLoaded']) {
  setInterval(() => {
    mainLoader();
  }, 100);
}
window.alreadyLoaded = true;

console.log('Loading!');

// Ignore some textboxes...
runOnSelector('.destructive-action', (e) => {
  e.click();
  return true;
});
runOnSelector(
  '.gwt-Button',
  (e) => {
    if (e.innerText == 'Save the empty screen now.') {
      e.click();
      return false;
    } else {
      return true;
    }
  }
);

// Get the workspace!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let workspace = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces)[0]];

/**
 * Runs a function on an element. If the function returns true,
 * that will be the last time the function is ran on that element.
 * @param selector an element selector
 * @param fn the function to run
 */
function runOnSelector(
  selector: string,
  fn: (el: HTMLElement) => boolean,
) {
  for (const e of document.querySelectorAll(selector)) {
    const el = e as HTMLElement & { alreadyRan: boolean };
    if (!el.alreadyRan) {
      el.alreadyRan = fn(el);
    }
  }
};

/** Keeps track of the last AI screen */
let lastScreen = '';

/** Loads the editor */
function mainLoader() {
  if (currScreen() != lastScreen) {
    workspace = Blockly.allWorkspaces[
      Object.keys(Blockly.allWorkspaces).filter((e) =>
        e.split('_').slice(1).join('_') == currScreen()
      )[0]
    ];
    loadBlocks();
    lastScreen = currScreen();
    console.log(lastScreen);
  }
  if (currEditor() == 'Designer') Editor.hide();
}

/** Loads new blocks onto the text editor */
function loadBlocks() {
  // const newText = w.getTopBlocks().map((b) => toText(b)).join('\n');
  // Editor.setText(newText);
}

document.onkeydown = (k) => {
  // Incrementing & decrementing number fields with arrows
  const activeElement = document.activeElement as HTMLInputElement;
  const value: string | undefined = activeElement.value;
  if (activeElement.tagName == 'INPUT' && isNumber(value)) {
    let nudge = (k.key == 'ArrowUp' ? 1 : k.key == 'ArrowDown' ? -1 : 0);
    if (k.ctrlKey) nudge *= 5;

    const decimal = (value.match(/\..*/) || [''])[0];
    activeElement.value = Math.trunc(parseFloat(value) + nudge) + decimal;
  }

  // Enable building!
  // if ('sr'.includes(k.key) && k.ctrlKey) build(sec.value), k.preventDefault();
  if (k.key == 'k' && k.ctrlKey) loadBlocks();
};

/** Checks is a value is a valid number */
function isNumber(n: string | number) {
  if (typeof n === 'string') {
    return !isNaN(parseFloat(n));
  } else {
    return !isNaN(n);
  }
}

/** Gets the currently selected editor */
function currEditor() {
  const element = document.querySelector(
    '.right > .ode-TextButton.ode-TextButton-up-disabled'
  ) as HTMLElement;
  return element.innerText;
}

/** Gets the currently selected screen */
function currScreen() {
  const element = document.querySelector(
    '.ya-Toolbar > .center > .ode-TextButton:nth-child(2)'
  ) as HTMLElement;
  return element.innerText.slice(0, -2);
}

// Canvas1.SetBackgroundPixelColor(0, 0, rgb([randi(0, 255), randi(0, 255), randi(0, 255)]))


