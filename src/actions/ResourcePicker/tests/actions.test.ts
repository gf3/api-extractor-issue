import {createMockApp} from 'test/helper';
import * as Helper from '../../helper';
import {cancel, close, open, select, update, ResourcePicker} from '../actions';
import {
  Action,
  CancelPayload,
  ClosePayload,
  Payload,
  Product,
  ResourceType,
  SelectPayload,
} from '../types';

describe('ResourcePicker Actions', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('open returns expected action', () => {
    const fakePayload: Payload = {
      id: 'Test1234',
      resourceType: ResourceType.Product,
    };
    const expectedAction = {
      group: 'Resource_Picker',
      payload: fakePayload,
      type: 'APP::RESOURCE_PICKER::OPEN',
    };
    expect(open(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('cancel returns expected action', () => {
    const fakePayload: CancelPayload = {
      id: 'Test1234',
    };
    const expectedAction = {
      group: 'Resource_Picker',
      payload: fakePayload,
      type: 'APP::RESOURCE_PICKER::CANCEL',
    };
    expect(cancel(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('close returns a cancel action', () => {
    const fakePayload: ClosePayload = {
      id: 'Test1234',
    };
    const expectedAction = {
      group: 'Resource_Picker',
      payload: fakePayload,
      type: 'APP::RESOURCE_PICKER::CANCEL',
    };
    expect(close(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('update returns expected action', () => {
    const fakePayload: Payload = {
      resourceType: ResourceType.Product,
    };
    const expectedAction = {
      group: 'Resource_Picker',
      payload: fakePayload,
      type: 'APP::RESOURCE_PICKER::UPDATE',
    };
    expect(update(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  it('select returns expected action', () => {
    const fakeProduct: Partial<Product> = {
      id: 'productId',
      variants: [
        {
          id: 'variantId',
        },
      ],
    };
    const fakePayload: SelectPayload = {
      id: 'Test1234',
      selection: [fakeProduct as Product],
    };
    const expectedAction = {
      group: 'Resource_Picker',
      payload: fakePayload,
      type: 'APP::RESOURCE_PICKER::SELECT',
    };
    expect(select(fakePayload)).toEqual(expectedAction);
    expect(Helper.actionWrapper).toHaveBeenCalledWith(expectedAction);
  });

  describe('dispatch()', () => {
    it('calls cancel() when it receives the close action', () => {
      const app = createMockApp();
      const resourcePicker = new ResourcePicker(app, {}, ResourceType.Product);
      const cancelSpy = jest.spyOn(resourcePicker as any, 'cancel');

      resourcePicker.dispatch(Action.CLOSE);

      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});
