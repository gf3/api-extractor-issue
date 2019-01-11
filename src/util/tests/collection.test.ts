import {addAndRemoveFromCollection} from '../collection';

describe('collection', function() {
  describe('addAndRemoveFromCollection', function() {
    it('adds an item to a collection', function() {
      const collection = [];
      const item1 = {item: 1};
      const item2 = {item: 2};

      addAndRemoveFromCollection(collection, item1);
      addAndRemoveFromCollection(collection, item2);

      expect(collection.length).toBe(2);
      // @ts-ignore Actually arrays do have an `includes` method...
      expect(collection.includes(item1)).toBe(true);
      // @ts-ignore Actually arrays do have an `includes` method...
      expect(collection.includes(item2)).toBe(true);
    });

    it('returns a function that removes an item from the collection', function() {
      const collection = [];
      const item1 = {item: 1};
      const item2 = {item: 2};
      const item3 = {item: 3};

      addAndRemoveFromCollection(collection, item1);
      const remove = addAndRemoveFromCollection(collection, item2);
      addAndRemoveFromCollection(collection, item3);

      remove();

      expect(collection.length).toBe(2);
      // @ts-ignore Actually arrays do have an `includes` method...
      expect(collection.includes(item1)).toBe(true);
      // @ts-ignore Actually arrays do have an `includes` method...
      expect(collection.includes(item2)).toBe(false);
      // @ts-ignore Actually arrays do have an `includes` method...
      expect(collection.includes(item3)).toBe(true);
    });

    it('invokes the given callback when the item is removed from the collection', function() {
      const collection = [];
      const item = {item: 1};
      const then = jest.fn();

      const remove = addAndRemoveFromCollection(collection, item, then);

      remove();

      expect(collection.length).toBe(0);
      expect(then).toHaveBeenCalled();
    });
  });
});
