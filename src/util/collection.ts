/**
 * @module util
 */

/**
 * Add an item to a collection, return a function that can then be used to
 * remove the item from the collection. Optionally accepting a callback that is
 * invoked when the item is removed from the collection.
 */
export function addAndRemoveFromCollection<T>(collection: T[], item: T, then?: Function) {
  collection.push(item);

  return () => {
    return removeFromCollection(collection, item, then);
  };
}

/**
 * Remove the item from the collection. Optionally accepting a callback that is
 * invoked when the item is removed from the collection.
 */
export function removeFromCollection<T>(collection: T[], item: T, then?: Function): boolean {
  const idx = collection.findIndex(i => i === item);

  if (idx >= 0) {
    collection.splice(idx, 1);
    if (then) {
      then(item);
    }

    return true;
  }

  return false;
}
