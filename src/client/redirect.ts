/**
 * @module client
 *
 */

export function shouldRedirect(frame: Window): boolean {
  return frame === window;
}

export function redirect(url: string) {
  const location = getLocation();
  if (!location) {
    return;
  }
  location.assign(url);
}

export function getLocation() {
  return hasWindow() ? window.location : undefined;
}

export function getWindow() {
  return hasWindow() ? window : undefined;
}

function hasWindow() {
  return typeof window !== 'undefined';
}
