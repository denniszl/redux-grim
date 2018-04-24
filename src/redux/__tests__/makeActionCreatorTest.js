import makeActionCreator from '../makeActionCreator';

describe('makeActionCreator', () => {
  let testContext;

  beforeEach(() => {
    testContext = { dispatch: jest.fn() };
  });

  describe('standard action', () => {
    test('should dispatch a start action', () => {
      const dispatch = testContext.dispatch;
      const get = makeActionCreator('item', 'get', '/get').apiFetch(() =>
        Promise.resolve('test')
      );
      get()(dispatch);
      const args = dispatch.mock.calls[0];
      expect(dispatch.mock.calls.length).toBe(1);
      expect(args[0]).toEqual({
        type: 'item.start',
        meta: {
          entityType: 'item',
          method: 'get'
        }
      });
    });

    test('should dispatch a success action', async () => {
      const dispatch = testContext.dispatch;
      const get = makeActionCreator('item', 'get', '/get').apiFetch(() =>
        Promise.resolve('test')
      );

      await get()(dispatch);
      const args = dispatch.mock.calls[1];
      expect(dispatch.mock.calls.length).toBe(2);
      expect(args[0]).toEqual({
        type: 'item.success',
        payload: 'test',
        meta: {
          entityType: 'item',
          method: 'get'
        }
      });
    });

    test('should dispatch an error action when an exception is thrown', async () => {
      const dispatch = testContext.dispatch;
      const get = makeActionCreator('item', 'get', '/get').apiFetch(() =>
        Promise.reject('error')
      );

      let error;
      try {
        await get()(dispatch);
      } catch (err) {
        error = err;
      }

      const args = dispatch.mock.calls[1];
      expect(error).toEqual('error');
      expect(dispatch.mock.calls.length).toBe(2);
      expect(args[0]).toEqual({
        type: 'item.error',
        payload: 'error',
        error: true,
        meta: {
          entityType: 'item',
          method: 'get'
        }
      });
    });
  });

  describe('api interactions', () => {
    test('should pass values to the api call', async () => {
      const dispatch = testContext.dispatch;
      const spy = jest.fn();
      const get = makeActionCreator('item', 'get', '/get').apiFetch(spy);
      get({ test: 1 })(dispatch);

      const args = spy.mock.calls[0];
      expect(spy.mock.calls.length).toBe(1);
      expect(args[0]).toBe('get');
      expect(args[1]).toBe('/get');
      expect(args[2]).toBeUndefined();
      expect(args[3]).toEqual({ test: 1 });
    });

    test('should pass the body to the api call', () => {
      const dispatch = testContext.dispatch;
      const spy = jest.fn();
      const body = makeActionCreator('item', 'post', '/body').apiFetch(spy);
      body({ test: 1 })(dispatch);

      const args = spy.mock.calls[0];
      expect(spy.mock.calls.length).toBe(1);
      expect(args[0]).toBe('post');
      expect(args[1]).toBe('/body');
      expect(args[2]).toEqual({ test: 1 });
      expect(args[3]).toBeUndefined();
    });

    test('should pass translated url to api call', () => {
      const dispatch = testContext.dispatch;
      const spy = jest.fn();
      const parameters = makeActionCreator(
        'item',
        'get',
        '/url/(zoneId)/parameters/(id)'
      ).apiFetch(spy);
      parameters('a', 'b')(dispatch);

      const args = spy.mock.calls[0];
      expect(spy.mock.calls.length).toBe(1);
      expect(args[0]).toBe('get');
      expect(args[1]).toBe('/url/a/parameters/b');
      expect(args[2]).toBeUndefined();
      expect(args[3]).toBeUndefined();
    });

    test('should pass translated parameters and body to the api call', () => {
      const dispatch = testContext.dispatch;
      const spy = jest.fn();
      const parametersAndBody = makeActionCreator(
        'item',
        'post',
        '/url/(zoneId)/parameters/[id]'
      ).apiFetch(spy);
      parametersAndBody('a', { id: 'b' })(dispatch);

      const args = spy.mock.calls[0];
      expect(spy.mock.calls.length).toBe(1);
      expect(args[0]).toBe('post');
      expect(args[1]).toBe('/url/a/parameters/b');
      expect(args[2]).toEqual({ id: 'b' });
      expect(args[3]).toBeUndefined();
    });
  });
});
