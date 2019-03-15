import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {
  getRawMtSelectedModel,
  getRawMtFeatureSelection,
  getRawMtModelFeatures,
  getRawMtModelMods,
  getRawCountries,
  getRawItems
} from './raw';

// cleaned raw feature selection
const getMtCleanedRFS = createSelector(
  getRawMtFeatureSelection,
  featureSelection => {
    if (featureSelection) {
      return featureSelection.map(d => {
        const p = d.split(',').map(g => g.match(/-?\w+/)[0]);
        if (p.length > 2) {
          return [p[0], p[1], Number(p[2])];
        }
        if (p.length > 1) {
          return [p[0], null, Number(p[1])];
        }
        return [p[0], null, null];
      });
    }
    return null;
  }
);

// feature set
const getMtFS = createSelector(
  getMtCleanedRFS,
  rfs => rfs && new Set(rfs.map(d[0]))
);

// category set
const getMtCS = createSelector(getMtCleanedRFS, rfs => {
  if (!rfs || rfs.every(d => d[1] === null)) {
    return null;
  }
  return new Set(rfs.filter(d => d[1] !== null));
});

// u set
const getMtUS = createSelector(getMtCleanedRFS, rfs => {
  if (!rfs || rfs.every(d => d[2] === null)) {
    return null;
  }
  return new Set(rfs.filter(d => d[2] !== null));
});

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
  [getMtFS, getMtFF],
  (fs, ff) => (fs ? ff.filter(d => fs.has(d.id)) : ff)
);

// category selection
export const getMtCategories = createSelector(
  [getMtCS, getMtFC],
  (cs, fc) => (cs ? fc.filter(d => cs.has(d.id)) : fc)
);

// element selection
export const getMtElements = createSelector(getMtUS, us => {
  const elements = [{id: 0, name: 'Export'}, {id: 1, name: 'Import'}];
  return us ? elements.filter(d => us.has(d.id)) : elements;
});

export const getMtPreFilteredFeatures = createSelector(
  [getMtFS, getMtFF],
  (fs, countries) => (fs ? ff.filter(d => !fs.has(d.id)) : [])
);

export const getMtPreFilteredCategories = createSelector(
  [getMtCS, getMtFC],
  (cs, items) => (cs ? fc.filter(d => !cs.has(d.id)) : [])
);

export const getMtPreFilteredElements = createSelector(us => {
  const elements = [{id: 0, name: 'Export'}, {id: 1, name: 'Import'}];
  return us ? elements.filter(d => !us.has(d.id)) : [];
});
