import * as Helper from '../../helper';
import {app} from '../actions';

describe('Print', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches app', () => {
    const expectedAction = {
      group: 'Print',
      type: 'APP::PRINT::APP',
    };
    expect(app()).toEqual(expectedAction);
  });
});
