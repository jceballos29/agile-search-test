export function subset<T>(left: T[], right: T[], comparer: (x: T, y: T) => boolean): boolean {
    if (comparer == null) comparer = (x,y) => x === y;
    if ((left || []).length === 0) return true;
    if ((right || []).length === 0) return false;
    if (left === right) return true;
    if (left.length > right.length) return false;
    return left.every(x => right.some(y => comparer(x, y)));
  }
  
  export function setEquals<T>(left: T[], right: T[], comparer: (x: T, y: T) => boolean): boolean {
    if (comparer == null) comparer = (x,y) => x === y;
    const l = left || [];
    const r = right || [];
    if (l.length !== r.length) return false;
    if (left === right) return true;
    return subset(l, r, comparer) && subset(r, l, comparer);
  }
  
  export function union<T>(left: T[], right: T[], comparer: (x: T, y: T) => boolean): T[] {
    if (comparer == null) comparer = (x,y) => x === y;
    return left.concat(right.filter(r => left.findIndex(l => comparer(l, r)) === -1));
  }
  
  export function difference<T>(left: T[], right: T[], comparer: (x: T, y: T) => boolean): T[] {
    if (comparer == null) comparer = (x,y) => x === y;
    return left.filter(l => right.findIndex(r => comparer(l, r)) === -1);
  }
  
  export function intersection<T>(left: T[], right: T[], comparer: (x: T, y: T) => boolean): T[] {
    if (comparer == null) comparer = (x,y) => x === y;
    return left.filter(l => right.findIndex(r => comparer(l, r)) !== -1);
  }