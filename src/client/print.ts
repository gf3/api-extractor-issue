/**
 * @module client
 *
 */

import {getWindow} from './redirect';

function isRunningOniOS() {
  return navigator.userAgent.indexOf('iOS') >= 0;
}

function createHiddenInput() {
  const currentWindow = getWindow();
  if (!currentWindow || !currentWindow.document || !currentWindow.document.body) {
    return;
  }
  const inputElement = window.document.createElement('input');
  inputElement.style.display = 'none';

  window.document.body.appendChild(inputElement);

  return inputElement;
}

function printWindow() {
  if (!getWindow()) {
    return;
  }
  // @ts-ignore: Fixed in TypeScript 2.8.2
  window.print();
}

function handleMobileAppPrint() {
  const input = createHiddenInput();
  if (!input) {
    return;
  }

  input.select();
  printWindow();
  input.remove();
}

export function handleAppPrint() {
  if (isRunningOniOS()) {
    handleMobileAppPrint();
  } else {
    printWindow();
  }
}
