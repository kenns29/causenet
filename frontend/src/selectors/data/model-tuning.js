import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {
  getRawMtSelectedModel,
  getRawMtModelFeatures,
  getRawMtModelMod,
  getRawCountries,
  getRawItems
} from './raw';

const ELEMENTS = [{id: 0, name: 'Export'}, {id: 1, name: 'Import'}];

// full features
export const getMtFF = createSelector(getRawCountries, countries =>
  countries.map(d => ({id: d.country_code, name: d.country}))
);

// full categories
export const getMtFC = createSelector(getRawItems, items =>
  items.map(d => ({id: d.item_code, name: d.item}))
);

// full elements
export const getMtFU = createSelector(rootSelector, () => ELEMENTS);

export const getMtFeatures = createSelector(
  [getMtFF, getRawMtModelMod],
  (f, mod) => {
    if (mod && mod.f) {
      const s = new Set(mod.f);
      return f.filter(d => s.has(d.id));
    }
    return f;
  }
);

export const getMtCategories = createSelector(
  [getMtFC, getRawMtModelMod],
  (c, mod) => {
    if (mod && mod.c) {
      const s = new Set(mod.c);
      return c.filter(d => s.has(d.id));
    }
    return c;
  }
);

export const getMtElements = createSelector(
  [getMtFU, getRawMtModelMod],
  (u, mod) => {
    if (mod && mod.u) {
      const s = new Set(mod.u);
      return u.filter(d => s.has(d.id));
    }
    return u;
  }
);

export const getMtPreFilteredFeatures = createSelector(
  [getMtFF, getRawMtModelMod],
  (f, mod) => {
    if (mod && mod.f) {
      const s = new Set(mod.f);
      return f.filter(d => !s.has(d.id));
    }
    return [];
  }
);

export const getMtPreFilteredCategories = createSelector(
  [getMtFC, getRawMtModelMod],
  (c, mod) => {
    if (mod && mod.c) {
      const s = new Set(mod.c);
      return c.filter(d => !s.has(d.id));
    }
    return [];
  }
);

export const getMtPreFilteredElements = createSelector(
  [getMtFU, getRawMtModelMod],
  (u, mod) => {
    if (mod && mod.u) {
      const s = new Set(mod.u);
      return u.filter(d => !s.has(d.id));
    }
    return [];
  }
);
