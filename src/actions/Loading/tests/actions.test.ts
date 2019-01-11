import {createMockApp} from 'test/helper';
import {create, start, stop, Loading} from '../actions';
import {Action} from '../types';

describe('Loading Actions', () => {
  it('dispatches start', () => {
    const expectedAction = {
      group: 'Loading',
      type: 'APP::LOADING::START',
    };
    expect(start()).toEqual(expect.objectContaining(expectedAction));
  });

  it('dispatches stop', () => {
    const expectedAction = {
      group: 'Loading',
      type: 'APP::LOADING::STOP',
    };
    expect(stop()).toEqual(expect.objectContaining(expectedAction));
  });
});

describe('Loading', () => {
  let app;
  beforeEach(() => {
    app = createMockApp();
  });

  it('dispatches start action on start', () => {
    const loading = new Loading(app);
    const expectedAction = {
      group: 'Loading',
      payload: {id: loading.id},
      type: 'APP::LOADING::START',
    };
    loading.dispatch(Action.START);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches stop action on stop', () => {
    const loading = new Loading(app);
    const expectedAction = {
      group: 'Loading',
      payload: {id: loading.id},
      type: 'APP::LOADING::STOP',
    };
    loading.dispatch(Action.STOP);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('create generates a new Loading instance', () => {
    const obj = create(app);
    expect(obj instanceof Loading).toBe(true);
  });
});
