/**
 * @module Camera
 */

import {ClientApplication} from '../../client';
import {actionWrapper, ActionSet} from '../helper';
import {Group} from '../types';
import {Action, ActionType, Options, OpenPayload, Payload} from './types';

/**
 * Camera
 */

export class Camera extends ActionSet {
  constructor(app: ClientApplication<any>, options?: Options) {
    super(app, Group.Camera, Group.Camera, options ? options.id : undefined);
  }

  dispatch(action: Action.OPEN, payload: OpenPayload): Camera;
  dispatch(action: Action.CAPTURE, payload: Payload): Camera;
  dispatch(action: Action, payload?: any) {
    switch (action) {
      case Action.CAPTURE:
        this.dispatchCameraAction(ActionType.CAPTURE, payload);
        break;
      case Action.OPEN:
        this.dispatchCameraAction(ActionType.OPEN, payload);
        break;
    }

    return this;
  }

  private dispatchCameraAction(type: ActionType, payload?: any) {
    this.app.dispatch(
      actionWrapper({
        type,
        group: Group.Camera,
        payload: {
          ...(payload || {}),
          id: this.id,
        },
      }),
    );
  }
}

export function create(app: ClientApplication<any>, options?: Options) {
  return new Camera(app, options);
}
