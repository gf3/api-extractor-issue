import Hooks from '../Hooks';
import {LifecycleHook} from '../types';

describe('Hooks', () => {
  it('get returns an array of handlers if handlers for event exists', () => {
    const cb1 = jest.fn().mockImplementation(next => args => {
      return next(args);
    });
    const cb2 = jest.fn().mockImplementation(next => args => {
      return next(args);
    });

    const cb3 = jest.fn().mockImplementation(next => args => {
      return next(args);
    });

    const hooks = new Hooks();

    hooks.set(LifecycleHook.UpdateAction, cb1);
    hooks.set(LifecycleHook.UpdateAction, cb2);
    hooks.set(LifecycleHook.DispatchAction, cb3);

    expect(hooks.get(LifecycleHook.UpdateAction)).toEqual([cb1, cb2]);
    expect(hooks.get(LifecycleHook.DispatchAction)).toEqual([cb3]);
  });

  it('get returns undefined if handlers for event does not exists', () => {
    const hooks = new Hooks();
    expect(hooks.get(LifecycleHook.UpdateAction)).toEqual(undefined);
  });

  describe('run', () => {
    it('calls only the final callback with given arguments if no handlers are found', () => {
      const final = jest.fn();
      const hooks = new Hooks();

      hooks.run(LifecycleHook.UpdateAction, final, {}, 'myValue');

      expect(final).toHaveBeenCalledWith('myValue');
    });

    it('calls each handler and the final callback with given arguments', () => {
      const cb1 = jest.fn().mockImplementation(next => value => {
        expect(value).toEqual('myValue');
        return next(value);
      });
      const cb2 = jest.fn().mockImplementation(next => value => {
        expect(value).toEqual('myValue');
        return next(value);
      });

      const final = jest.fn();
      const hooks = new Hooks();

      hooks.set(LifecycleHook.UpdateAction, cb1);
      hooks.set(LifecycleHook.UpdateAction, cb2);

      hooks.run(LifecycleHook.UpdateAction, final, {}, 'myValue');

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
      expect(final).toHaveBeenCalledWith('myValue');
    });

    it('does not call the final callback if middleware interrupts the chain', () => {
      const cb1 = jest.fn().mockImplementation(next => args => {
        return next(args);
      });
      const cb2 = jest.fn().mockImplementation(next => args => {});
      const final = jest.fn();
      const hooks = new Hooks();

      hooks.set(LifecycleHook.UpdateAction, cb1);
      hooks.set(LifecycleHook.UpdateAction, cb2);

      hooks.run(LifecycleHook.UpdateAction, final, {}, 'myValue');

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
      expect(final).not.toHaveBeenCalledWith('myValue');
    });

    it('calls the final callback with modified arguments', () => {
      const cb1 = jest.fn().mockImplementation(next => value => {
        expect(value).toEqual('1');
        return next('2');
      });
      const cb2 = jest.fn().mockImplementation(next => value => {
        expect(value).toEqual('2');
        return next('3');
      });
      const final = jest.fn();
      const hooks = new Hooks();

      hooks.set(LifecycleHook.UpdateAction, cb1);
      hooks.set(LifecycleHook.UpdateAction, cb2);

      hooks.run(LifecycleHook.UpdateAction, final, {}, '1');

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();

      expect(final).toHaveBeenCalledWith('3');
    });

    it('does not call a handler that has been removed', () => {
      const cb1 = jest.fn().mockImplementation(next => args => {
        return next(args);
      });
      const cb2 = jest.fn().mockImplementation(next => args => {
        return next(args);
      });
      const final = jest.fn();
      const hooks = new Hooks();

      const unsubscribeCb1 = hooks.set(LifecycleHook.UpdateAction, cb1);
      hooks.set(LifecycleHook.UpdateAction, cb2);

      unsubscribeCb1();

      hooks.run(LifecycleHook.UpdateAction, final, {}, 'myValue');

      expect(cb1).not.toHaveBeenCalled();

      expect(cb2).toHaveBeenCalled();
      expect(final).toHaveBeenCalledWith('myValue');
    });

    it('returns the result of the final callback', () => {
      const cb1 = jest.fn().mockImplementation(next => args => {
        return next('2');
      });
      const cb2 = jest.fn().mockImplementation(next => args => {
        return next('3');
      });
      const final = value => {
        expect(value).toEqual('3');
        return 'all done!';
      };
      const hooks = new Hooks();

      hooks.set(LifecycleHook.UpdateAction, cb1);
      hooks.set(LifecycleHook.UpdateAction, cb2);

      const result = hooks.run(LifecycleHook.UpdateAction, final, {}, '1');

      expect(result).toEqual('all done!');
    });

    it('returns the result of the handler if it interrupts the chain', () => {
      const cb1 = jest.fn().mockImplementation(next => args => {
        return next('2');
      });
      const cb2 = jest.fn().mockImplementation(next => args => 'interrupted');
      const final = jest.fn();
      const hooks = new Hooks();

      hooks.set(LifecycleHook.UpdateAction, cb1);
      hooks.set(LifecycleHook.UpdateAction, cb2);

      const result = hooks.run(LifecycleHook.UpdateAction, final, {}, '1');

      expect(result).toEqual('interrupted');
    });
  });

  it('maintains the given context through the callback chain', () => {
    const context = {haha: 'lol'};
    const cb1 = jest.fn().mockImplementation(function(next) {
      return function() {
        expect(this).toBe(context);
        return next('2');
      };
    });
    const cb2 = jest.fn().mockImplementation(function(next) {
      return function() {
        expect(this).toBe(context);
        return next('3');
      };
    });
    const final = jest.fn().mockImplementation(function(next) {
      return function() {
        expect(this).toBe(context);
        return 'done';
      };
    });

    const hooks = new Hooks();

    hooks.set(LifecycleHook.UpdateAction, cb1);
    hooks.set(LifecycleHook.UpdateAction, cb2);

    hooks.run(LifecycleHook.UpdateAction, final, context, '1');

    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
    expect(final).toHaveBeenCalled();
  });
});
