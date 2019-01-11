import {handleAppPrint} from '../print';
import * as Redirect from '../redirect';

describe('handleAppPrint', () => {
  let windowPrintSpy;
  beforeEach(() => {
    windowPrintSpy = jest.fn();
    Object.assign(window, {print: windowPrintSpy});
  });

  afterEach(() => {
    Object.defineProperty(window, 'print', {value: undefined});
  });

  it('calls window.print', () => {
    handleAppPrint();
    setTimeout(() => {
      expect(windowPrintSpy).toHaveBeenCalled();
    });
  });

  describe('iOS', () => {
    beforeEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'iOS',
      });
    });

    it('calls window.print', () => {
      handleAppPrint();
      setTimeout(() => {
        expect(windowPrintSpy).toHaveBeenCalled();
      });
    });

    it('it creates and then removes the hidden input after print', () => {
      const mockInput = window.document.createElement('input');
      const createElementSpy = jest
        .spyOn(window.document, 'createElement')
        .mockReturnValue(mockInput);

      jest.spyOn(mockInput, 'select');
      jest.spyOn(mockInput, 'remove');

      handleAppPrint();

      expect(mockInput.style.display).toEqual('none');
      expect(mockInput.select).toHaveBeenCalled();
      expect(mockInput.remove).toHaveBeenCalled();
    });

    it('it does not call window.print if window.document is missing', () => {
      Object.defineProperty(window, 'document', {value: null});
      handleAppPrint();
      setTimeout(() => {
        expect(windowPrintSpy).not.toHaveBeenCalled();
      });
    });

    it('it does not call window.print if window.document.body is missing', () => {
      Object.defineProperty(window, 'document', {value: {}});
      handleAppPrint();
      setTimeout(() => {
        expect(windowPrintSpy).not.toHaveBeenCalled();
      });
    });

    it('it does not call window.print if window is not defined', () => {
      jest.spyOn(Redirect, 'getWindow').mockReturnValueOnce(undefined);
      handleAppPrint();
      setTimeout(() => {
        expect(windowPrintSpy).not.toHaveBeenCalled();
      });
    });
  });
});
