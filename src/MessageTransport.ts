import {AnyAction} from './actions/types';
import {fromAction, AppActionType} from './actions/Error';
import {isAppBridgeAction, isAppMessage} from './actions/validator';
import {TransportDispatch} from './client';
import {addAndRemoveFromCollection} from './util/collection';

/**
 * @internal
 */
export type HandlerData = {data: AnyAction};

/**
 * @internal
 */
export type Handler = (event: HandlerData) => void;

/**
 * @internal
 */
export interface MessageTransport {
  dispatch(message: any): void;
  hostFrame: Window;
  localOrigin: string;
  subscribe(handler: Handler): () => void;
}

/**
 * Create a MessageTransport from an IFrame.
 * @remarks
 * Used on the host-side to create a postMessage MessageTransport.
 * @beta
 */
export function fromFrame(frame: HTMLIFrameElement, localOrigin: string): MessageTransport {
  const handlers: Handler[] = [];

  if (typeof frame === 'undefined' || !frame.ownerDocument || !frame.ownerDocument.defaultView) {
    throw fromAction('App frame is undefined', AppActionType.WINDOW_UNDEFINED);
  }

  const parent = frame.ownerDocument.defaultView;

  parent.addEventListener('message', event => {
    if (event.origin !== localOrigin || !isAppMessage(event)) {
      return;
    }

    for (const handler of handlers) {
      handler(event);
    }
  });

  return {
    localOrigin,

    hostFrame: parent,

    dispatch(message) {
      const contentWindow = frame.contentWindow;
      if (contentWindow) {
        contentWindow.postMessage(message, '*');
      }
    },

    subscribe(handler) {
      return addAndRemoveFromCollection(handlers, handler);
    },
  };
}

/**
 * Create a MessageTransport from a parent window.
 * @remarks
 * Used on the client-side to create a postMessage MessageTransport.
 * @beta
 */
export function fromWindow(contentWindow: Window, localOrigin: string): MessageTransport {
  const handlers: Handler[] = [];
  if (typeof window !== undefined && contentWindow !== window) {
    window.addEventListener('message', event => {
      if (
        event.source !== contentWindow ||
        !(isAppBridgeAction(event.data.payload) || isAppMessage(event))
      ) {
        return;
      }

      for (const handler of handlers) {
        handler(event);
      }
    });
  }

  return {
    localOrigin,

    hostFrame: contentWindow,

    dispatch(message: TransportDispatch) {
      if (!message.source || !message.source.shopOrigin) {
        return;
      }

      const messageOrigin = `https://${message.source.shopOrigin}`;

      contentWindow.postMessage(message, messageOrigin);
    },

    subscribe(handler) {
      return addAndRemoveFromCollection(handlers, handler);
    },
  };
}
