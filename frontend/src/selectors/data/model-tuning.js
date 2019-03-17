import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {
  getRawMtSelectedModel,
  getRawMtModelFeatures,
  getRawMtModelMod,
  getRawCountries,
  getRawItems
} from './raw';

// cleaned raw model features
const getMtCleanedMF = createSelector(getRawMtModelFeatures, mf =>
  mf.map(d => {
    const p = d.split(',').map(g => g.match(/-?\w+/)[0]);
    if (p.length > 2) {
      return [p[0], p[1], Number(p[2])];
    }
    if (p.length > 1) {
      return [p[0], null, Number(p[1])];
    }
    return [p[0], null, null];
  })
);

// feature set
const getMtFS = createSelector(
  getMtCleanedMF,
  mf => new Set(mf.map(d => d[0]))
);

// category set
const getMtCS = createSelector(
  getMtCleanedMF,
  rfs => new Set(rfs.filter(d => d[1] !== null))
);

// u set
const getMtUS = createSelector(
  getMtCleanedMF,
  rfs => new Set(rfs.filter(d => d[2] !== null))
);

// model mod pre filter feature set
const getMtModPfFS = createSelector(
  getRawMtModelMod,
  mod => (mod && mod.pff ? new Set(mod.pff) : new Set())
);

// model mod pre filter category set
const getMtModPfCS = createSelector(
  getRawMtModelMod,
  mod => (mod && mod.pfc ? new Set(mod.pfc) : new Set())
);

// model mod pre filter element set
const getMtModPfUS = createSelector(
  getRawMtModelMod,
  mod => (mod && mod.pfu ? new Set(mod.pfu) : new Set())
);

// model mod feature set
const getMtModFS = createSelector(
  getRawMtModelMod,
  mod => (mod && mod.f ? new Set(mod.f) : new Set())
);

const getMtModCS = createSelector(
  getRawMtModelMod,
  mod => (mod && mod.c ? new Set(mod.c) : new Set())
);

const getMtModUS = createSelector(
  getRawMtModelMod,
  mod => (mod && mod.u ? new Set(mod.u) : new Set())
);

// full features
const getMtFF = createSelector(getRawCountries, countries =>
  countries.map(d => ({id: d.country_code, name: d.country}))
);

// full categories
const getMtFC = createSelector(getRawItems, items =>
  items.map(d => ({id: d.item_code, name: d.item}))
);

// feature selection
export const getMtFeatures = createSelector(
  [getMtFS, getMtModPfFS, getMtFF],
  (s, p, f) => {
    let r = f;
    if (s) {
      r = r.filter(d => !s.has(d.id));
    }
    if (p) {
      r = r.filter(d => !p.has(d.id));
    }
    return r;
  }
);

// category selection
export const getMtCategories = createSelector(
  [getMtCS, getMtModPfCS, getMtFC],
  (s, p, f) => {
    let r = f;
    if (s) {
      r = r.filter(d => !s.has(d.id));
    }
    if (p) {
      r = r.filter(d => !p.has(d.id));
    }
    return r;
  }
);

// element selection
export const getMtElements = createSelector([getMtUS, getMtModPfUS], (s, p) => {
  let r = [{id: 0, name: 'Export'}, {id: 1, name: 'Import'}];
  if (s) {
    r = r.filter(d => !s.has(d.id));
  }
  if (p) {
    r = r.filter(d => !p.has(d.id));
  }
  return r;
});

export const getMtPreFilteredFeatures = createSelector(
  [getMtFS, getMtModPfFS, getMtFF],
  (s, p, f) => {
    const rs = s ? f.filter(d => s.has(d.id)) : [];
    const rp = p ? f.filter(d => p.has(d.id)) : [];
    return [...rs, ...rp];
  }
);

export const getMtPreFilteredCategories = createSelector(
  [getMtCS, getMtModPfCS, getMtFC],
  (s, p, f) => {
    const rs = s ? f.filter(d => s.has(d.id)) : [];
    const rp = p ? f.filter(d => p.has(d.id)) : [];
    return [...rs, ...rp];
  }
);

export const getMtPreFilteredElements = createSelector(
  [getMtUS, getMtModPfUS],
  (s, p) => {
    const f = [{id: 0, name: 'Export'}, {id: 1, name: 'Import'}];
    const rs = s ? f.filter(d => s.has(d.id)) : [];
    const rp = p ? f.filter(d => p.has(d.id)) : [];
    return [...rs, ...rp];
  }
);
