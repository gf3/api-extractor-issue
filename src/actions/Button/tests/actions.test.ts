import {createMockApp} from 'test/helper';
import {create, Button} from '../actions';
import {Action} from '../types';

jest.mock('../../uuid', (fakeId = 'fakeId') => jest.fn().mockReturnValue(fakeId));

describe('Button', () => {
  let app;
  const defaultOptions = {label: 'Save'};
  const expectedDefaultProps = {
    ...defaultOptions,
    disabled: false,
  };

  beforeEach(() => {
    app = createMockApp();
  });

  it('sets expected properties', () => {
    const button = new Button(app, defaultOptions);
    const expectedProps = {
      group: 'Button',
      type: 'Button',
      ...expectedDefaultProps,
    };
    expect(button).toMatchObject(expectedProps);
  });

  it('get options returns expected properties', () => {
    const button = new Button(app, defaultOptions);
    expect(button.options).toEqual(expectedDefaultProps);
  });

  it('dispatches generic click action on click', () => {
    const fakeButtonPayload = {
      message: 'Hi',
    };
    const button = new Button(app, defaultOptions);
    const expectedAction = {
      payload: {
        id: button.id,
        payload: fakeButtonPayload,
      },
      type: 'APP::BUTTON::CLICK',
    };
    button.dispatch(Action.CLICK, fakeButtonPayload);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches click action with groups and subgroups on click', () => {
    const fakeButtonPayload = {
      message: 'Hi',
    };
    const button = new Button(app, defaultOptions);

    button.group = 'Header';
    button.subgroups = ['Title', 'NavBar'];

    const expectedAction = {
      group: 'Header',
      payload: {
        id: button.id,
        payload: fakeButtonPayload,
      },
      type: 'APP::HEADER::TITLE::NAVBAR::BUTTON::CLICK',
    };
    button.dispatch(Action.CLICK, fakeButtonPayload);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('create generates a new Button instance when given button options', () => {
    const obj = create(app, defaultOptions);
    expect(obj instanceof Button).toBe(true);
    expect(obj.options).toEqual(expectedDefaultProps);
  });

  it('set updates options, payload and dispatch update action', () => {
    const button = new Button(app, defaultOptions);
    const newOptions = {label: 'New label'};
    const expectedOptions = {...expectedDefaultProps, ...newOptions};
    const expectedPayload = {
      id: button.id,
      ...expectedOptions,
    };
    const expectedAction = {
      payload: {
        id: button.id,
        ...expectedPayload,
      },
      type: 'APP::BUTTON::UPDATE',
    };
    button.set(newOptions);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(button.options).toMatchObject(expectedOptions);
    expect(button.payload).toEqual(expectedPayload);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('set does not dispatch update action if shouldUpdate = false', () => {
    const button = new Button(app, defaultOptions);
    const newOptions = {label: 'New label'};
    button.set(newOptions, false);
    expect(app.dispatch).not.toHaveBeenCalled();
  });
});
