import * as Helper from '../../helper';
import {ActionType as ErrorActionType} from '../../Error';
import {update, validationError} from '../actions';
import {ActionType} from '../types';

describe('Features', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches app', () => {
    const expectedAction = {
      group: 'Features',
      type: 'APP::FEATURES::UPDATE',
    };
    expect(update()).toEqual(expectedAction);
  });

  it('returns undefined for ActionType.UPDATE action', () => {
    expect(
      validationError({
        type: ActionType.UPDATE,
      }),
    ).toEqual(undefined);
  });

  it('returns INVALID_ACTION_TYPE error for unknown actions', () => {
    const invalidAction = {type: 'Unknown', payload: {}};
    expect(validationError(invalidAction)).toMatchObject({
      type: ErrorActionType.INVALID_ACTION_TYPE,
    });
  });
});
