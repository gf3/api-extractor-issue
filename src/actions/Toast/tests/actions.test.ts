import {createMockApp} from 'test/helper';
import * as Helper from '../../helper';
import {clear, create, show, Toast} from '../actions';
import {Action, Payload} from '../types';

jest.mock('../../uuid', (fakeId = 'fakeId') => jest.fn().mockReturnValue(fakeId));

describe('Toast Actions', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('show returns expected action', () => {
    const fakePayload: Payload = {
      duration: 5000,
      isError: true,
      message: 'toastContent',
    };
    const expectedAction = {
      group: 'Toast',
      payload: fakePayload,
      type: 'APP::TOAST::SHOW',
    };
    expect(show(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('clear returns expected action', () => {
    const expectedId = 'Test123';
    const expectedAction = {
      group: 'Toast',
      payload: {
        id: expectedId,
      },
      type: 'APP::TOAST::CLEAR',
    };
    expect(clear({id: expectedId})).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });
});

describe('Toast', () => {
  let app;
  const defaultOptions = {message: 'Hi there', isError: true, duration: 5000};

  beforeEach(() => {
    app = createMockApp();
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('sets expected properties', () => {
    const toastMesage = new Toast(app, defaultOptions);
    const expectedProps = {group: 'Toast', type: 'Toast', ...defaultOptions};
    expect(toastMesage).toMatchObject(expectedProps);
  });

  it('get options returns expected properties', () => {
    const toastMesage = new Toast(app, defaultOptions);
    expect(toastMesage.options).toEqual(defaultOptions);
  });

  it('dispatches show action on show', () => {
    const toastMesage = new Toast(app, defaultOptions);
    const expectedAction = {
      group: 'Toast',
      payload: defaultOptions,
      type: 'APP::TOAST::SHOW',
    };
    toastMesage.dispatch(Action.SHOW);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches clear action on clear', () => {
    const toastMesage = new Toast(app, defaultOptions);
    const expectedAction = {
      group: 'Toast',
      payload: {id: 'fakeId'},
      type: 'APP::TOAST::CLEAR',
    };
    toastMesage.dispatch(Action.CLEAR);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('create generates a new Toast instance when given ToastOptions', () => {
    const obj = create(app, defaultOptions);
    expect(obj instanceof Toast).toBe(true);
    expect(obj.options).toEqual(defaultOptions);
  });
});
