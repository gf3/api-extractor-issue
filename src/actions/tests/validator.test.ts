import {isAppMessage, isAppBridgeAction, isFromApp} from '../validator';

describe('validator', () => {
  it('isAppBridgeAction returns expected result', () => {
    expect(isAppBridgeAction({type: 'APP::SOME_ACTION'})).toBe(true);
    expect(isAppBridgeAction({type: 'SOME_ACTION'})).toBe(false);
    expect(isAppBridgeAction({type: 'SOMEACTION::APP::SOMETHING'})).toBe(false);
    expect(isAppBridgeAction({})).toBe(false);
    expect(isAppBridgeAction()).toBe(false);
    expect(isAppBridgeAction(1234)).toBe(false);
  });

  it('isFromApp returns expected result', () => {
    expect(isFromApp({source: {apiKey: '1234'}})).toBe(true);
    expect(isFromApp({source: 1234})).toBe(false);
    expect(isFromApp({source: '1234'})).toBe(false);
    expect(isFromApp({type: 'SOMEACTION::APP::SOMETHING'})).toBe(false);
    expect(isFromApp({})).toBe(false);
    expect(isFromApp()).toBe(false);
    expect(isFromApp(1234)).toBe(false);
  });

  it('isAppMessage returns true when message data type is `dispatch`', () => {
    expect(isAppMessage({data: {type: 'dispatch'}})).toBe(true);
  });
  it('isAppMessage returns true when message data type is `getState`', () => {
    expect(isAppMessage({data: {type: 'getState'}})).toBe(true);
  });

  it('isAppMessage returns false when message data does not match `dispatch` or `getState`', () => {
    expect(isAppMessage({data: 'some data'})).toBe(false);
    expect(isAppMessage({data: {type: 'something else'}})).toBe(false);
    expect(isAppMessage({data: null})).toBe(false);
    expect(isAppMessage({data: 1234})).toBe(false);
    expect(isAppMessage({})).toBe(false);
    expect(isAppMessage()).toBe(false);
  });
});
