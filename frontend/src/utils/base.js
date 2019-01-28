export const isNull = v => v === null || v === undefined;

export const functor = v => (typeof v === 'function' ? v : () => v);

export const makeAccessor = v =>
  isNull(v) ? v => v : typeof v === 'string' ? d => d[v] : functor(v);

export const array2Object = (array, key, value) => {
  const [fk, fv] = [key, value].map(makeAccessor);
  return array.reduce((m, v) => Object.assign(m, {[fk(v)]: fv(v)}), {});
};

export const isArray = v =>
  Object.prototype.toString.call(v) === '[object Array]';

export const filterObject = (object, key, value) => {
  const [fk, fv] = [key, value].map(makeAccessor);
  return Object.entries(object).reduce(
    (o, [k, v]) =>
      fk(k) && (fv(v) || (isNull(value) && isNull(v)))
        ? Object.assign(o, {[k]: v})
        : o,
    {}
  );
};
