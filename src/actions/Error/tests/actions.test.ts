import * as Helper from '../../helper';
import {AppBridgeError} from '../../Error';
import {
  fromAction,
  invalidAction,
  invalidActionType,
  invalidPayload,
  isErrorEventName,
  networkAction,
  permissionAction,
  persistenceAction,
  throwError,
  unexpectedAction,
  unsupportedOperationAction,
} from '../actions';
import {ActionType} from '../types';

describe('Error', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches invalidPayload', () => {
    const errorAction = {
      group: 'some-group',
      payload: {
        id: 'some-id',
      },
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        id: 'some-id',
        message: expect.any(String),
        type: 'APP::ERROR::INVALID_PAYLOAD',
      },
      type: 'APP::ERROR::INVALID_PAYLOAD',
    };
    expect(invalidPayload(errorAction)).toEqual(expectedAction);
  });

  it('dispatches invalidAction', () => {
    const errorAction = {
      group: 'some-group',
      payload: 'something',
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        message: expect.any(String),
        type: 'APP::ERROR::INVALID_ACTION',
      },
      type: 'APP::ERROR::INVALID_ACTION',
    };
    expect(invalidAction(errorAction)).toEqual(expectedAction);
  });

  it('dispatches invalidActionType', () => {
    const errorAction = {
      group: 'some-group',
      payload: 'something',
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        message: expect.any(String),
        type: 'APP::ERROR::INVALID_ACTION_TYPE',
      },
      type: 'APP::ERROR::INVALID_ACTION_TYPE',
    };
    expect(invalidActionType(errorAction)).toEqual(expectedAction);
  });

  it('dispatches unexpectedAction', () => {
    const errorAction = {
      group: 'some-group',
      payload: 'something',
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        message: expect.any(String),
        type: 'APP::ERROR::UNEXPECTED_ACTION',
      },
      type: 'APP::ERROR::UNEXPECTED_ACTION',
    };
    expect(unexpectedAction(errorAction)).toEqual(expectedAction);
  });

  it('dispatches unsupportedOperationAction', () => {
    const errorAction = {
      group: 'some-group',
      id: 'some-id',
      payload: {
        id: 'some-id',
      },
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        id: 'some-id',
        message: expect.any(String),
        type: 'APP::ERROR::UNSUPPORTED_OPERATION',
      },
      type: 'APP::ERROR::UNSUPPORTED_OPERATION',
    };
    expect(unsupportedOperationAction(errorAction)).toEqual(expectedAction);
  });

  it('dispatches persistenceAction', () => {
    const errorAction = {
      group: 'some-group',
      id: 'some-id',
      payload: {
        id: 'some-id',
      },
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        id: 'some-id',
        message: expect.any(String),
        type: 'APP::ERROR::PERSISTENCE',
      },
      type: 'APP::ERROR::PERSISTENCE',
    };
    expect(persistenceAction(errorAction)).toEqual(expectedAction);
  });

  it('dispatches networkAction', () => {
    const errorAction = {
      group: 'some-group',
      id: 'some-id',
      payload: {
        id: 'some-id',
      },
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        id: 'some-id',
        message: expect.any(String),
        type: 'APP::ERROR::NETWORK',
      },
      type: 'APP::ERROR::NETWORK',
    };
    expect(networkAction(errorAction)).toEqual(expectedAction);
  });

  it('dispatches permissionAction', () => {
    const errorAction = {
      group: 'some-group',
      id: 'some-id',
      payload: {
        id: 'some-id',
      },
      type: 'APP::SOMEACTION',
      version: 'some-version',
    };
    const expectedAction = {
      group: 'Error',
      payload: {
        action: errorAction,
        id: 'some-id',
        message: expect.any(String),
        type: 'APP::ERROR::PERMISSION',
      },
      type: 'APP::ERROR::PERMISSION',
    };
    expect(permissionAction(errorAction)).toEqual(expectedAction);
  });

  it('isErrorEventName returns true if findMatchInEnum returns match', () => {
    const spy = jest.spyOn(Helper, 'findMatchInEnum').mockImplementation(() => 'SOME_ERROR');
    expect(isErrorEventName('error')).toBe(true);
  });

  it('isErrorEventName returns true if findMatchInEnum returns undefined', () => {
    const spy = jest.spyOn(Helper, 'findMatchInEnum').mockImplementation(() => undefined);
    expect(isErrorEventName('error')).toBe(false);
  });

  it('throwError throws expected error from an action with message', () => {
    const orgAction = Helper.actionWrapper({type: 'SOME_ACTION', payload: 'something'});
    const message = 'Helpful message';
    const error = new AppBridgeError(`${ActionType.INVALID_ACTION}: ${message}`);
    error.action = orgAction;
    error.type = ActionType.INVALID_ACTION;

    // Note that jest's toThrowError assert does not work with custom errors
    // We need to catch the error to do the assertion
    let thrownError;
    try {
      throwError(ActionType.INVALID_ACTION, orgAction, message);
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toEqual(error);
  });

  it('throwError throws expected error from an action without message', () => {
    const orgAction = Helper.actionWrapper({type: 'SOME_ACTION', payload: 'something'});
    const error = new AppBridgeError(`${ActionType.INVALID_ACTION}`);
    error.action = orgAction;
    error.type = ActionType.INVALID_ACTION;

    // Note that jest's toThrowError assert does not work with custom errors
    // We need to catch the error to do the assertion
    let thrownError;
    try {
      throwError(ActionType.INVALID_ACTION, orgAction);
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toEqual(error);
  });

  it('throwError throws expected error without action', () => {
    const orgAction = Helper.actionWrapper({type: 'SOME_ACTION', payload: 'something'});
    const message = 'Helpful message';
    const error = new AppBridgeError(`${ActionType.INVALID_ACTION}: ${message}`);
    error.type = ActionType.INVALID_ACTION;

    // Note that jest's toThrowError assert does not work with custom errors
    // We need to catch the error to do the assertion
    let thrownError;
    try {
      throwError(ActionType.INVALID_ACTION, orgAction, message);
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toEqual(error);
  });

  it('fromAction creates custom Error object', () => {
    const message = 'Error hint';
    const orgAction = Helper.actionWrapper({type: 'SOME_ACTION', payload: 'something'});
    const error = fromAction(message, ActionType.INVALID_ACTION, orgAction);

    expect(error instanceof AppBridgeError).toBe(true);
    expect(Error.prototype.isPrototypeOf(error)).toBe(true);
    expect(error).toMatchObject({
      action: orgAction,
      message: `${ActionType.INVALID_ACTION}: ${message}`,
      name: 'AppBridgeError',
      type: ActionType.INVALID_ACTION,
    });
  });
});
