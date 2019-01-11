import {createMockApp} from 'test/helper';
import * as ButtonHelper from '../../buttonHelper';
import * as Helper from '../../helper';
import {Button} from '../../Button';
import {create, ButtonGroup} from '../actions';
import {Action} from '../types';

describe('ButtonGroup', () => {
  let app;
  let buttonA;
  let buttonB;
  let defaultOptions;
  let defaultExpectedPayload;

  beforeEach(() => {
    app = createMockApp();
    buttonA = new Button(app, {label: 'Button A'});
    buttonB = new Button(app, {label: 'Button B'});
    defaultOptions = {label: 'More options', buttons: [buttonA, buttonB]};
    defaultExpectedPayload = {
      buttons: [buttonA.payload, buttonB.payload],
      disabled: false,
      label: defaultOptions.label,
    };

    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('sets expected properties', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    const expectedProps = {group: 'ButtonGroup', type: 'ButtonGroup', label: defaultOptions.label};
    expect(buttonGroup).toMatchObject(expectedProps);
  });

  it('sets buttons as expected', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    expect(buttonGroup.buttons).toEqual(defaultExpectedPayload.buttons);
  });

  it('sets buttonOptions as expected', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    expect(buttonGroup.buttonsOptions).toEqual([buttonA, buttonB]);
  });

  it('get options returns expected properties', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    const expectedOptions = {
      ...defaultOptions,
      disabled: false,
    };
    expect(buttonGroup.options).toEqual(expectedOptions);
  });

  it('get payload returns expected properties', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    const expectedPayload = {
      id: buttonGroup.id,
      ...defaultExpectedPayload,
    };
    expect(buttonGroup.payload).toEqual(expectedPayload);
  });

  it('calls getSingleButton for each button with expected args', () => {
    const getSingleButtonSpy = jest.spyOn(ButtonHelper, 'getSingleButton');
    const buttonGroup = new ButtonGroup(app, defaultOptions);

    expect(getSingleButtonSpy).toHaveBeenCalledTimes(2);
    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      buttonGroup,
      buttonA,
      buttonGroup.subgroups,
      buttonGroup.updateButtons,
    );
    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      buttonGroup,
      buttonB,
      buttonGroup.subgroups,
      buttonGroup.updateButtons,
    );
  });

  it('subscribes to children update actions', () => {
    const subscribeSpy = jest.spyOn(ButtonGroup.prototype, 'subscribe');

    const buttonGroup = new ButtonGroup(app, defaultOptions);

    expect(subscribeSpy).toHaveBeenCalledTimes(2);

    expect(subscribeSpy).toHaveBeenCalledWith(
      Action.UPDATE,
      expect.any(Function),
      buttonA.component,
    );
    expect(subscribeSpy).toHaveBeenCalledWith(
      Action.UPDATE,
      expect.any(Function),
      buttonB.component,
    );
  });

  it('updateButtons calls updateActionFromPayload with expected args and dispatch update action', () => {
    const updateActionFromPayloadSpy = jest
      .spyOn(Helper, 'updateActionFromPayload')
      .mockImplementation(jest.fn(_ => true));

    const updateSpy = jest.spyOn(ButtonGroup.prototype, 'dispatch');
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    const newButtonPayload = {
      id: buttonA.id,
      label: 'Hello',
    };
    buttonGroup.updateButtons(newButtonPayload);
    expect(updateActionFromPayloadSpy).toHaveBeenCalledWith(buttonA.payload, newButtonPayload);
    expect(updateSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('dispatches expected update action on update', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    buttonGroup.group = 'Header';
    buttonGroup.subgroups = ['Title', 'NavBar'];
    const expectedAction = {
      group: 'Header',
      payload: {
        id: buttonGroup.id,
        ...defaultExpectedPayload,
      },
      type: 'APP::HEADER::TITLE::NAVBAR::BUTTONGROUP::UPDATE',
    };
    buttonGroup.dispatch(Action.UPDATE);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('set updates options, payload and dispatch update action', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    const newOptions = {label: 'New label'};
    const expectedOptions = {...defaultExpectedPayload, ...newOptions};
    const expectedPayload = {
      id: buttonGroup.id,
      ...expectedOptions,
    };
    const expectedAction = {
      payload: {
        id: buttonGroup.id,
        ...expectedPayload,
      },
      type: 'APP::BUTTONGROUP::UPDATE',
    };
    buttonGroup.set(newOptions);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(buttonGroup.options).toMatchObject(expectedOptions);
    expect(buttonGroup.payload).toEqual(expectedPayload);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('set does not dispatch update action if shouldUpdate = false', () => {
    const buttonGroup = new ButtonGroup(app, defaultOptions);
    const newOptions = {label: 'New label'};
    buttonGroup.set(newOptions, false);
    expect(app.dispatch).not.toHaveBeenCalled();
  });

  it('create generates a new ButtonGroup instance when given ButtonGroupOptions', () => {
    const obj = create(app, defaultOptions);
    expect(obj instanceof ButtonGroup).toBe(true);
    expect(obj.options).toMatchObject(defaultOptions);
  });
});
