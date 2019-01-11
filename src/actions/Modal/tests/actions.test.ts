import {ClientApplication} from '../../../client';
import {createMockApp} from 'test/helper';
import * as ButtonHelper from '../../buttonHelper';
import * as Helper from '../../helper';
import {Action as ButtonAction, Button} from '../../Button';
import {
  clickFooterButton,
  closeModal,
  create,
  openModal,
  update,
  Modal,
  ModalIframe,
  ModalMessage,
} from '../actions';
import {Action, ActionType, IframePayload, MessagePayload} from '../types';

jest.mock('../../uuid', (fakeId = 'fakeId') => jest.fn().mockReturnValue(fakeId));

describe('Modal Actions', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('openModal returns expected action', () => {
    const fakePayload: MessagePayload = {
      message: 'Hi there!',
      title: 'My Modal',
    };
    const expectedAction = {
      group: 'Modal',
      payload: fakePayload,
      type: 'APP::MODAL::OPEN',
    };
    expect(openModal(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('openModal with url returns expected action', () => {
    const fakePayload: IframePayload = {
      title: 'My Iframe Modal',
      url: 'https://example.com',
    };
    const expectedAction = {
      group: 'Modal',
      payload: fakePayload,
      type: 'APP::MODAL::OPEN',
    };
    expect(openModal(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('closeModal returns expected action', () => {
    const expectedId = 'Test123';
    const expectedAction = {
      group: 'Modal',
      payload: {
        id: expectedId,
      },
      type: 'APP::MODAL::CLOSE',
    };
    expect(closeModal({id: expectedId})).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('clickFooterButton returns expected action', () => {
    const expectedId = 'Test123';
    const expectedPayload = {id: expectedId, payload: {data: 'some data'}};
    const expectedAction = {
      group: 'Modal',
      payload: expectedPayload,
      type: 'APP::MODAL::FOOTER::BUTTON::CLICK',
    };
    expect(clickFooterButton(expectedId, {data: 'some data'})).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });
});

describe('Modal footer', () => {
  let app;
  const defaultOptions = {title: 'My Message Modal', message: 'My content'};

  beforeEach(() => {
    app = createMockApp();
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sets button existing subscriptions to modal's footer's namespace on initialization", () => {
    const buttonOptions = {label: 'Test'};
    const button = new Button(app, buttonOptions);
    const buttonPayload = {
      message: 'hi',
    };

    button.subscribe(ButtonAction.CLICK, jest.fn());

    button.dispatch(ButtonAction.CLICK, buttonPayload);
    // Should use default button namespace
    const buttonAction = {
      group: 'Button',
      payload: {
        id: button.id,
        payload: buttonPayload,
      },
      type: 'APP::BUTTON::CLICK',
    };
    expect(app.dispatch).toHaveBeenCalledWith(buttonAction);

    const options = {
      ...defaultOptions,
      footer: {
        buttons: {primary: button},
      },
    };
    const modal = new ModalMessage(app, options);

    button.dispatch(ButtonAction.CLICK, buttonPayload);

    // Should use parent namespace
    const footerButtonAction = {
      group: 'Modal',
      payload: {
        id: button.id,
        payload: buttonPayload,
      },
      type: 'APP::MODAL::FOOTER::BUTTON::CLICK',
    };
    expect(app.dispatch).toHaveBeenCalledWith(footerButtonAction);
  });

  it("sets subsequent button subscriptions to modal's footer's namespace", () => {
    const buttonOptions = {label: 'Test'};
    const button = new Button(app, buttonOptions);
    const buttonPayload = {
      message: 'hi',
    };

    const options = {
      ...defaultOptions,
      footer: {
        buttons: {primary: button},
      },
    };
    const modal = new ModalMessage(app, options);
    button.subscribe(ButtonAction.CLICK, jest.fn());
    button.dispatch(ButtonAction.CLICK, buttonPayload);

    // Should use parent namespace
    const footerButtonAction = {
      group: 'Modal',
      payload: {
        id: button.id,
        payload: buttonPayload,
      },
      type: 'APP::MODAL::FOOTER::BUTTON::CLICK',
    };
    expect(app.dispatch).toHaveBeenCalledWith(footerButtonAction);
  });

  it('resets button subscription when unsubscribe is called with unsubscribeChildren = `false`', () => {
    const buttonOptions = {label: 'Test'};
    const button = new Button(app, buttonOptions);
    const buttonPayload = {
      message: 'hi',
    };
    button.subscribe(ButtonAction.CLICK, jest.fn());

    const options = {
      ...defaultOptions,
      footer: {
        buttons: {primary: button},
      },
    };
    const modal = new ModalMessage(app, options);
    modal.subscribe(Action.OPEN, jest.fn());

    button.dispatch(ButtonAction.CLICK, buttonPayload);

    // Should use parent namespace
    const footerButtonAction = {
      group: 'Modal',
      payload: {
        id: button.id,
        payload: buttonPayload,
      },
      type: 'APP::MODAL::FOOTER::BUTTON::CLICK',
    };
    expect(app.dispatch).toHaveBeenCalledWith(footerButtonAction);

    modal.unsubscribe(false);

    button.dispatch(ButtonAction.CLICK, buttonPayload);

    // Should use default button namespace
    const buttonAction = {
      group: 'Button',
      payload: {
        id: button.id,
        payload: buttonPayload,
      },
      type: 'APP::BUTTON::CLICK',
    };
    expect(app.dispatch).toHaveBeenCalledWith(buttonAction);
  });

  it("unsubcribes all subscriptions after modal's unsubscribe is called with unsubscribeChildren = `true`", () => {
    const unsubscribeStub = jest.fn();
    app.subscribe = () => unsubscribeStub;

    const buttonOptions = {label: 'Test'};

    const buttonPayload = {
      message: 'hi',
    };

    const button = new Button(app, buttonOptions);

    const options = {
      ...defaultOptions,
      footer: {
        buttons: {primary: button},
      },
    };
    const modal = new ModalMessage(app, options);
    button.subscribe(ButtonAction.CLICK, jest.fn());
    modal.subscribe(Action.OPEN, jest.fn());

    unsubscribeStub.mockClear();
    modal.unsubscribe(true);
    // Should be called three times - once for modal click, once for modal update (when child button changes), and once for child button
    expect(unsubscribeStub.mock.calls.length).toBe(3);
  });

  it('setFooterPrimaryButton should call getSingleButton for primary button and set footer primary button as expected', () => {
    const button = new Button(app, {label: 'Primary'});
    const modal = new ModalMessage(app, defaultOptions);

    const updatePrimaryFooterButtonSpy = jest.spyOn(modal, 'updatePrimaryFooterButton');
    const dispatchSpy = jest.spyOn(modal, 'dispatch').mockImplementation(jest.fn());
    const getSingleButtonSpy = jest.spyOn(ButtonHelper, 'getSingleButton');

    modal.set({
      footer: {
        buttons: {
          primary: button,
        },
      },
    });

    expect(getSingleButtonSpy).toHaveBeenCalledTimes(1);

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      modal,
      button,
      ['Footer'],
      expect.any(Function),
    );

    const updateHandler = getSingleButtonSpy.mock.calls[0][3];

    const updatePayload = {id: button.id, label: 'New label'};
    updateHandler(updatePayload);
    expect(updatePrimaryFooterButtonSpy).toHaveBeenCalledWith(updatePayload, expect.any(Function));

    expect(dispatchSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('setFooterPrimaryButton should call getUpdatedChildActions with expected params', () => {
    const button = new Button(app, {label: 'Button 1'});
    const modal = new ModalMessage(app, defaultOptions);

    const getUpdatedChildActionsSpy = jest.spyOn(modal, 'getUpdatedChildActions');
    const dispatchSpy = jest.spyOn(modal, 'dispatch').mockImplementation(jest.fn());

    const newOptions = {
      footer: {
        buttons: {
          primary: button,
        },
      },
    };

    modal.set(newOptions);

    expect(getUpdatedChildActionsSpy).toHaveBeenCalledWith([newOptions.footer.buttons.primary], []);
  });

  it('setFooterSecondaryButtons should call getSingleButton for each secondary button', () => {
    const button1 = new Button(app, {label: 'Button 1'});
    const button2 = new Button(app, {label: 'Button 2'});
    const modal = new ModalMessage(app, defaultOptions);

    const getSingleButtonSpy = jest.spyOn(ButtonHelper, 'getSingleButton');
    const updateSecondaryFooterButtonSpy = jest.spyOn(modal, 'updateSecondaryFooterButton');
    const dispatchSpy = jest.spyOn(modal, 'dispatch').mockImplementation(jest.fn());

    modal.set({
      footer: {
        buttons: {
          secondary: [button1, button2],
        },
      },
    });

    expect(getSingleButtonSpy).toHaveBeenCalledTimes(2);

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      modal,
      button1,
      ['Footer'],
      expect.any(Function),
    );

    expect(getSingleButtonSpy).toHaveBeenCalledWith(
      modal,
      button2,
      ['Footer'],
      expect.any(Function),
    );

    const updateHandler = getSingleButtonSpy.mock.calls[0][3];

    const updatePayload = {id: button1.id, label: 'New label'};
    updateHandler(updatePayload);
    expect(updateSecondaryFooterButtonSpy).toHaveBeenCalledWith(
      updatePayload,
      expect.any(Function),
    );

    expect(dispatchSpy).toHaveBeenCalledWith(Action.UPDATE);
  });

  it('setFooterSecondaryButtons should call getUpdatedChildActions with expected params', () => {
    const button1 = new Button(app, {label: 'Button 1'});
    const button2 = new Button(app, {label: 'Button 2'});
    const modal = new ModalMessage(app, defaultOptions);

    const getUpdatedChildActionsSpy = jest.spyOn(modal, 'getUpdatedChildActions');
    const dispatchSpy = jest.spyOn(modal, 'dispatch').mockImplementation(jest.fn());

    const newOptions = {
      footer: {
        buttons: {
          secondary: [button1, button2],
        },
      },
    };

    modal.set(newOptions);

    expect(getUpdatedChildActionsSpy).toHaveBeenCalledWith(newOptions.footer.buttons.secondary, []);
  });
});
