import {createMockApp} from 'test/helper';
import * as ButtonGroupHelper from '../../buttonGroupHelper';
import * as ButtonHelper from '../../buttonHelper';
import * as Helper from '../../helper';
import {Button} from '../../Button';
import {ButtonGroup} from '../../ButtonGroup';

import {clickActionButton, clickBreadcrumb, TitleBar} from '../../TitleBar';
import {create} from '../actions';
import {Action} from '../types';

describe('TitleBar', () => {
  let app;
  let buttonPrimary;
  let groupedButton1;
  let groupedButton2;
  let breadcrumbButton;
  let buttonGroup;
  let defaultOptions;
  let primarySecondaryOptions;
  let allOptions;
  let actionsGroupSubgroups;
  let breadcrumbsGroupSubgroups;
  let expectedAllOptions;
  let updateFromPayloadMock;

  beforeEach(() => {
    app = createMockApp();
    buttonPrimary = new Button(app, {label: 'Primary button'});
    groupedButton1 = new Button(app, {label: 'Grouped button 1'});
    groupedButton2 = new Button(app, {label: 'Grouped button 2'});
    breadcrumbButton = new Button(app, {label: 'My breadcrumb'});
    buttonGroup = new ButtonGroup(app, {
      buttons: [groupedButton1, groupedButton2],
      label: 'More actions',
    });

    defaultOptions = {title: 'Page title'};
    primarySecondaryOptions = {
      ...defaultOptions,
      buttons: {
        primary: buttonPrimary,
        secondary: [buttonGroup],
      },
    };

    allOptions = {
      ...primarySecondaryOptions,
      breadcrumbs: breadcrumbButton,
    };

    actionsGroupSubgroups = {group: 'TitleBar', subgroups: ['Buttons']};
    breadcrumbsGroupSubgroups = {group: 'TitleBar', subgroups: ['Breadcrumbs']};
    expectedAllOptions = {
      breadcrumbs: {...breadcrumbButton, ...breadcrumbsGroupSubgroups},
      buttons: {
        primary: {...buttonPrimary, ...actionsGroupSubgroups},
        secondary: [{...buttonGroup, ...actionsGroupSubgroups}],
      },
      title: defaultOptions.title,
    };

    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));

    updateFromPayloadMock = jest
      .spyOn(Helper, 'updateActionFromPayload')
      .mockImplementation(jest.fn(_ => true));
  });

  it('sets expected properties', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const expectedProps = {group: 'TitleBar', type: 'TitleBar', title: defaultOptions.title};
    expect(titleBar).toMatchObject(expectedProps);
  });

  it('sets buttons as expected for primary and secondary buttons', () => {
    const titleBar = new TitleBar(app, primarySecondaryOptions);
    const expectedButtons = {
      primary: buttonPrimary.payload,
      secondary: [buttonGroup.payload],
    };
    expect(titleBar.buttons).toEqual(expectedButtons);
  });

  it('sets buttonOptions as expected for primary and secondary buttons', () => {
    const titleBar = new TitleBar(app, primarySecondaryOptions);
    const expectedButtonsOptions = {
      primary: {...buttonPrimary, ...actionsGroupSubgroups},
      secondary: [{...buttonGroup, ...actionsGroupSubgroups}],
    };
    expect(titleBar.buttonsOptions).toEqual(expectedButtonsOptions);
  });

  it('get options returns expected properties', () => {
    const titleBar = new TitleBar(app, allOptions);
    expect(titleBar.options).toEqual(expectedAllOptions);
  });

  it('get payload returns expected properties', () => {
    const titleBar = new TitleBar(app, allOptions);
    const expectedPayload = {
      breadcrumbs: breadcrumbButton.payload,
      buttons: {
        primary: buttonPrimary.payload,
        secondary: [buttonGroup.payload],
      },
      id: titleBar.id,
      title: defaultOptions.title,
    };
    expect(titleBar.payload).toEqual(expectedPayload);
  });

  it('calls getSingleButton for primary and secondary buttons with expected args', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const getSingleButtonSpy = jest.spyOn(ButtonHelper, 'getSingleButton');
    const updateSecondaryButtonsSpy = jest.spyOn(titleBar, 'updateSecondaryButtons');
    const updatePrimaryButtonSpy = jest.spyOn(titleBar, 'updatePrimaryButton');

    titleBar.set({
      buttons: {
        primary: buttonPrimary,
        secondary: [groupedButton1, groupedButton2],
      },
    });

    expect(getSingleButtonSpy).toHaveBeenCalledTimes(3);

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      titleBar,
      {...buttonPrimary, ...actionsGroupSubgroups},
      actionsGroupSubgroups.subgroups,
      updatePrimaryButtonSpy,
    );

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      titleBar,
      {...groupedButton1, ...actionsGroupSubgroups},
      actionsGroupSubgroups.subgroups,
      updateSecondaryButtonsSpy,
    );

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      titleBar,
      {...groupedButton2, ...actionsGroupSubgroups},
      actionsGroupSubgroups.subgroups,
      updateSecondaryButtonsSpy,
    );
  });

  it('calls getGroupedButton for grouped secondary buttons with expected args', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const updateSecondaryButtonsSpy = jest.spyOn(titleBar, 'updateSecondaryButtons');
    const getGroupedButtonSpy = jest.spyOn(ButtonGroupHelper, 'getGroupedButton');
    titleBar.set({
      buttons: {
        secondary: [buttonGroup],
      },
    });

    expect(getGroupedButtonSpy).toHaveBeenCalledWith(
      titleBar,
      {...buttonGroup, ...actionsGroupSubgroups},
      actionsGroupSubgroups.subgroups,
      updateSecondaryButtonsSpy,
    );
  });

  it('calls getSingleButton for breadcrumbs with expected args', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const getSingleButtonSpy = jest.spyOn(ButtonHelper, 'getSingleButton');
    const updateBreadcrumbButtonSpy = jest.spyOn(titleBar, 'updateBreadcrumbButton');
    titleBar.set({
      breadcrumbs: breadcrumbButton,
    });

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      titleBar,
      {...breadcrumbButton, ...breadcrumbsGroupSubgroups},
      breadcrumbsGroupSubgroups.subgroups,
      updateBreadcrumbButtonSpy,
    );
  });

  it('subscribes to children updates for primary, secondary and breadcrumbs', () => {
    const subscribeSpy = jest.spyOn(TitleBar.prototype, 'subscribe');
    const titleBar = new TitleBar(app, allOptions);

    expect(subscribeSpy).toHaveBeenCalledTimes(3);

    expect(subscribeSpy).toHaveBeenCalledWith(Action.UPDATE, expect.any(Function), {
      ...buttonPrimary.component,
      subgroups: actionsGroupSubgroups.subgroups,
    });

    expect(subscribeSpy).toHaveBeenCalledWith(Action.UPDATE, expect.any(Function), {
      ...buttonGroup.component,
      subgroups: actionsGroupSubgroups.subgroups,
    });

    expect(subscribeSpy).toHaveBeenCalledWith(Action.UPDATE, expect.any(Function), {
      ...breadcrumbButton.component,
      subgroups: breadcrumbsGroupSubgroups.subgroups,
    });
  });

  it('updatePrimaryButton calls updateActionFromPayload with expected args and dispatch update action', () => {
    const updateSpy = jest.spyOn(TitleBar.prototype, 'dispatch');
    const titleBar = new TitleBar(app, primarySecondaryOptions);
    const expectedButton = {
      ...buttonPrimary.options,
      id: buttonPrimary.id,
    };
    const newButtonPayload = {
      id: buttonPrimary.id,
      label: 'Hello',
    };
    titleBar.updatePrimaryButton(newButtonPayload);
    expect(updateFromPayloadMock).toHaveBeenCalledWith(expectedButton, newButtonPayload);
    expect(updateSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('updateSecondaryButtons calls updateActionFromPayload with expected args and dispatch update action for grouped buttons', () => {
    const updateSpy = jest.spyOn(TitleBar.prototype, 'dispatch');
    const titleBar = new TitleBar(app, primarySecondaryOptions);

    const newButtonPayload = {
      buttons: [
        {
          id: '123',
          label: 'New button',
        },
      ],
      id: buttonGroup.id,
      label: 'Updated label',
    };
    titleBar.updateSecondaryButtons(newButtonPayload);
    expect(updateFromPayloadMock).toHaveBeenCalledWith(buttonGroup.payload, newButtonPayload);
    expect(updateSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('updateSecondaryButtons calls updateActionFromPayload with expected args and dispatch update action for single buttons', () => {
    const updateSpy = jest.spyOn(TitleBar.prototype, 'dispatch');
    const titleBar = new TitleBar(app, {
      ...defaultOptions,
      buttons: {
        secondary: [groupedButton1],
      },
    });

    const newButtonPayload = {
      id: groupedButton1.id,
      label: 'Updated label',
    };
    titleBar.updateSecondaryButtons(newButtonPayload);
    expect(updateFromPayloadMock).toHaveBeenCalledWith(groupedButton1.payload, newButtonPayload);
    expect(updateSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('updateBreadcrumbButton calls updateActionFromPayload with expected args and dispatch update action for breadcrumbs', () => {
    const updateSpy = jest.spyOn(TitleBar.prototype, 'dispatch');
    const titleBar = new TitleBar(app, {
      ...defaultOptions,
      breadcrumbs: breadcrumbButton,
    });

    const newButtonPayload = {
      id: breadcrumbButton.id,
      label: 'Updated label',
    };
    titleBar.updateBreadcrumbButton(newButtonPayload);
    expect(updateFromPayloadMock).toHaveBeenCalledWith(breadcrumbButton.payload, newButtonPayload);
    expect(updateSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('dispatches expected update action on update', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const expectedAction = {
      group: 'TitleBar',
      payload: {
        id: titleBar.id,
        title: defaultOptions.title,
      },
      type: 'APP::TITLEBAR::UPDATE',
    };

    app.dispatch.mockReset();
    titleBar.dispatch(Action.UPDATE);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('set updates options, payload and dispatch update action', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const newOptions = {title: 'New title', ...allOptions};
    const expectedOptions = {...expectedAllOptions, ...newOptions};
    const expectedPayload = {
      breadcrumbs: breadcrumbButton.payload,
      buttons: {
        primary: buttonPrimary.payload,
        secondary: [buttonGroup.payload],
      },
      id: titleBar.id,
      title: defaultOptions.title,
    };

    const expectedAction = {
      payload: {
        id: titleBar.id,
        ...expectedPayload,
      },
      type: 'APP::TITLEBAR::UPDATE',
    };

    app.dispatch.mockReset();

    titleBar.set(newOptions);

    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(titleBar.options).toMatchObject(expectedOptions);
    expect(titleBar.payload).toEqual(expectedPayload);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches update action on initialize', () => {
    const updateSpy = jest.spyOn(TitleBar.prototype, 'dispatch');
    const titleBar = new TitleBar(app, defaultOptions);
    expect(updateSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('set does not dispatch update action if shouldUpdate = false', () => {
    const titleBar = new TitleBar(app, defaultOptions);
    const newOptions = {title: 'New label'};
    app.dispatch.mockReset();
    titleBar.set(newOptions, false);
    expect(app.dispatch).not.toHaveBeenCalled();
  });

  it('create generates a new TitleBar instance when given Options', () => {
    const obj = create(app, allOptions);
    expect(obj instanceof TitleBar).toBe(true);
    expect(obj.options).toMatchObject(expectedAllOptions);
  });

  it('clickActionButton returns expected action', () => {
    const fakeButtonId = '123';
    const fakeButtonPayload = {
      message: 'Hi',
    };
    const expectedAction = {
      group: 'TitleBar',
      payload: {
        id: fakeButtonId,
        payload: fakeButtonPayload,
      },
      type: 'APP::TITLEBAR::BUTTONS::BUTTON::CLICK',
    };
    expect(clickActionButton(fakeButtonId, fakeButtonPayload)).toEqual(expectedAction);
  });

  it('clickBreadcrumb returns expected action', () => {
    const fakeButtonId = '123';
    const fakeButtonPayload = {
      message: 'Hi',
    };
    const expectedAction = {
      group: 'TitleBar',
      payload: {
        id: fakeButtonId,
        payload: fakeButtonPayload,
      },
      type: 'APP::TITLEBAR::BREADCRUMBS::BUTTON::CLICK',
    };
    expect(clickBreadcrumb(fakeButtonId, fakeButtonPayload)).toEqual(expectedAction);
  });
});
