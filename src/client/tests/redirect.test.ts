import {getLocation, getWindow, shouldRedirect} from '../redirect';

describe('Redirect', () => {
  it('returns true if the app frame is the top frame', () => {
    expect(shouldRedirect(window)).toEqual(true);
  });

  it('returns false if the app frame is not the top frame', () => {
    const parentWindow = {} as any;
    expect(shouldRedirect(parentWindow)).toEqual(false);
  });

  it('getWindow returns window', () => {
    expect(getWindow()).toBe(window);
  });

  it('getLocation returns window.location', () => {
    expect(getLocation()).toBe(window.location);
  });
});
