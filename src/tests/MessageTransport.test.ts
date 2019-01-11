import {start as LoadingStart} from '../actions/Loading';
import {fromFrame, fromWindow} from '../MessageTransport';

const mockFrame = () => ({
  contentWindow: {
    postMessage: jest.fn(),
  },
  ownerDocument: {
    defaultView: {
      addEventListener: jest.fn(),
    },
  },
});

const mockWindow = (origin = 'https://example.com') => ({
  location: {origin},
  postMessage: jest.fn(),
});

const postMessage = (frame, event) => {
  const handlers = frame.ownerDocument.defaultView.addEventListener.mock.calls.map(
    ([_, handler]) => handler,
  );

  for (const handler of handlers) {
    handler(event);
  }
};

describe('MessageTransport', function() {
  describe('fromFrame', function() {
    let frame;
    const origin = 'https://example.com';
    beforeEach(function() {
      frame = mockFrame();
    });

    it('sets the transport local origin', function() {
      const testOrigin = 'https://example.com';
      const transport = fromFrame(frame, testOrigin);
      expect(transport.localOrigin).toBe(testOrigin);
    });

    it('triggers handlers for subscriptions when the event is an app message', function() {
      const event = {origin, data: {type: 'dispatch', payload: {condiment: 'maple syrup'}}};
      const handler = jest.fn();
      const transport = fromFrame(frame, origin);

      transport.subscribe(handler);

      postMessage(frame, event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('does not trigger handlers when messages are not app messages', function() {
      const localFromFrame = require('../MessageTransport').fromFrame;
      const event = {origin, data: {type: 'unknown', payload: {condiment: 'maple syrup'}}};
      const handler = jest.fn();
      const transport = localFromFrame(frame, origin);

      transport.subscribe(handler);

      postMessage(frame, event);

      expect(handler).not.toHaveBeenCalledWith(event);
    });

    it('does not trigger handlers when messages origin does not match local origin', function() {
      const event = {
        data: {type: 'dispatch', payload: {condiment: 'maple syrup'}},
        origin: 'https://somethingelse.com',
      };
      const handler = jest.fn();
      const transport = fromFrame(frame, origin);

      transport.subscribe(handler);

      postMessage(frame, event);

      expect(handler).not.toHaveBeenCalledWith(event);
    });

    it('does not trigger handlers that have been unsubscribed', function() {
      const event = {origin, data: {condiment: 'maple syrup'}};
      const handler = jest.fn();
      const transport = fromFrame(frame, origin);
      const unsubscribe = transport.subscribe(handler);

      unsubscribe();

      postMessage(frame, event);

      expect(handler).not.toHaveBeenCalledWith(event);
    });

    it('dispatches messages to the frame’s window via `postMessage`', function() {
      const event = {ketchup: 'bad', mustard: 'good'};
      const transport = fromFrame(frame, origin);

      transport.dispatch(event);

      expect(frame.contentWindow.postMessage).toHaveBeenCalledWith(event, '*');
    });
  });

  describe('fromWindow', function() {
    let contentWindow;
    let listenerSpy;

    beforeEach(function() {
      contentWindow = mockWindow();
      listenerSpy = jest.fn();

      // @ts-ignore: Actually, there _is_ an `addEventListener` in `window`
      global.addEventListener = listenerSpy;
    });

    it('sets the transport local origin to given origin', function() {
      const transport = fromWindow(contentWindow, 'https://supercoolsite.com');
      expect(transport.localOrigin).toBe('https://supercoolsite.com');
    });

    it('triggers handlers for subscriptions for App Bridge actions messages from matching source', function() {
      const event = {data: {type: 'dispatch', payload: LoadingStart()}, source: contentWindow};
      const handler = jest.fn();
      const transport = fromWindow(contentWindow, '');

      transport.subscribe(handler);

      listenerSpy.mock.calls[0][1](event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('triggers handlers when message is AppMessage getState', function() {
      const event = {data: {type: 'getState', payload: {any: 'payload'}}, source: contentWindow};
      const handler = jest.fn();
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.subscribe(handler);

      listenerSpy.mock.calls[0][1](event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('triggers handlers when message is AppMessage dispatch', function() {
      const event = {data: {type: 'dispatch', payload: {any: 'payload'}}, source: contentWindow};
      const handler = jest.fn();
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.subscribe(handler);

      listenerSpy.mock.calls[0][1](event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('does not trigger handlers when messages are from a different source', function() {
      const event = {data: {type: 'dispatch', payload: LoadingStart()}, source: {}};
      const handler = jest.fn();
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.subscribe(handler);

      listenerSpy.mock.calls[0][1](event);

      expect(handler).not.toHaveBeenCalledWith(event);
    });

    it('does not trigger handlers when messages are not App Bridge actions', function() {
      const event = {data: {condiment: 'maple syrup'}, source: contentWindow};
      const handler = jest.fn();
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.subscribe(handler);

      listenerSpy.mock.calls[0][1](event);

      expect(handler).not.toHaveBeenCalledWith(event);
    });

    it('does not trigger handlers that have been unsubscribed', function() {
      const event = {data: {type: 'dispatch', payload: LoadingStart()}, source: contentWindow};
      const handler = jest.fn();
      const transport = fromWindow(contentWindow, 'http://example.com');
      const unsubscribe = transport.subscribe(handler);

      unsubscribe();

      listenerSpy.mock.calls[0][1](event);

      expect(handler).not.toHaveBeenCalledWith(event);
    });

    it('dispatches messages to the content window via `postMessage` with the origin from event source', function() {
      const event = {ketchup: 'bad', mustard: 'good', source: {shopOrigin: 'myCoolShop.com'}};
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.dispatch(event);

      expect(contentWindow.postMessage).toHaveBeenCalledWith(event, 'https://myCoolShop.com');
    });

    it('does not dispatch a message to the content window via `postMessage` if source is not provided', function() {
      const event = {ketchup: 'bad', mustard: 'good'};
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.dispatch(event);

      expect(contentWindow.postMessage).not.toHaveBeenCalled();
    });

    it('does not dispatch a message to the content window via `postMessage` if source shop origin is not provided', function() {
      const event = {ketchup: 'bad', mustard: 'good', source: {}};
      const transport = fromWindow(contentWindow, 'http://example.com');

      transport.dispatch(event);

      expect(contentWindow.postMessage).not.toHaveBeenCalled();
    });

    it('does NOT add a window message handler if the contentWindow provided is the same as the current window', function() {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      fromWindow(window, 'https://supercoolsite.com');
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('adds a window message handler if the contentWindow provided is NOT same as the current window', function() {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      fromWindow(contentWindow, 'https://supercoolsite.com');
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });
});
