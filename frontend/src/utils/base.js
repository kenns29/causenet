export const isNull = v => v === null || v === undefined;

export const functor = v => (typeof v === 'function' ? v : () => v);

export const makeAccessor = v =>
  isNull(v) ? v => v : typeof v === 'string' ? d => d[v] : functor(v);

export const array2Object = (array, key, value) => {
  const [fk, fv] = [key, value].map(makeAccessor);
  return array.reduce((m, v) => Object.assign(m, {[fk(v)]: fv(v)}), {});
};
