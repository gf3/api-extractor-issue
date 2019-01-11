export interface Indexable {
  [key: string]: any;
}

/**
 * @internal
 */
export default function mergeProps<T extends Indexable, T2 extends Indexable>(
  obj: T,
  newObj: T2,
): T | T2 | undefined {
  if (newObj === undefined) {
    return undefined;
  }
  // If setting to a different prototype or a non-object or non-array, don't merge any props
  if (
    typeof obj === 'undefined' ||
    !Object.getPrototypeOf(obj).isPrototypeOf(newObj) ||
    (newObj.constructor.name !== 'Object' && newObj.constructor.name !== 'Array')
  ) {
    return newObj;
  }

  const clone: any = {};

  Object.keys(newObj).forEach(key => {
    const exists = obj.hasOwnProperty(key);
    if (!exists) {
      clone[key] = newObj[key];
    } else {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        clone[key] = mergeProps(obj[key] as Indexable, newObj[key] as Indexable);
      } else {
        clone[key] = newObj[key];
      }
    }
  });

  // Copy old props that are not present in new object only if this is a simple object
  Object.keys(obj).forEach(key => {
    const exists = newObj.hasOwnProperty(key);
    if (!exists) {
      clone[key] = obj[key];
    }
  });

  // Set prototype of cloned object to match original
  Object.setPrototypeOf(clone, Object.getPrototypeOf(obj));

  return clone;
}
