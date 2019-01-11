import {createMockApp} from 'test/helper';
import * as Helper from '../../../helper';
import {create, push, replace, History} from '../actions';
import {Action} from '../types';

describe('History Actions', () => {
  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches push', () => {
    const payload = {
      path: '/settings',
    };
    const expectedAction = {
      payload,
      group: 'Navigation',
      type: 'APP::NAVIGATION::HISTORY::PUSH',
    };
    expect(push(payload)).toEqual(expectedAction);
  });

  it('dispatches replace', () => {
    const payload = {
      path: '/settings',
    };
    const expectedAction = {
      payload,
      group: 'Navigation',
      type: 'APP::NAVIGATION::HISTORY::REPLACE',
    };
    expect(replace(payload)).toEqual(expectedAction);
  });
});

describe('History', () => {
  let app;
  beforeEach(() => {
    app = createMockApp();
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches push action on push', () => {
    const history = new History(app);
    const expectedAction = {
      group: 'Navigation',
      payload: {id: history.id, path: '/settings'},
      type: 'APP::NAVIGATION::HISTORY::PUSH',
    };
    history.dispatch(Action.PUSH, '/settings');
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches push action on push', () => {
    const history = new History(app);
    const expectedAction = {
      group: 'Navigation',
      payload: {id: history.id, path: '/settings'},
      type: 'APP::NAVIGATION::HISTORY::REPLACE',
    };
    history.dispatch(Action.REPLACE, '/settings');
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('create generates a new History instance', () => {
    const obj = create(app);
    expect(obj instanceof History).toBe(true);
    expect(obj.group).toEqual('Navigation');
    expect(obj.type).toEqual('History');
  });
});
