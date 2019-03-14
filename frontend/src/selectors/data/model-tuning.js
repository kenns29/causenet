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

// feature selection
export const getMtFeatures = createSelector(
  [getMtFS, getRawCountries],
  (fs, countries) =>
    fs ? countries.filter(d => fs.has(d.country_code)) : countries
);

// category selection
export const getMtCategories = createSelector(
  [getMtCS, getRawItems],
  (cs, items) => (cs ? items.filter(d => cs.has(d.item_code)) : items)
);

// element selection
export const getMtElements = createSelector(getMtUS, us => {
  const elements = [
    {element_code: 0, element: 'Export'},
    {element_code: 1, element: 'Import'}
  ];
  return us ? elements.filter(d => us.has(d.element_code)) : elements;
});

export const getMtPreFilteredFeatures = createSelector(
  [getMtFS, getRawCountries],
  (fs, countries) => (fs ? countries.filter(d => !fs.has(d.country_code)) : [])
);

export const getMtPreFilteredCategories = createSelector(
  [getMtCS, getRawItems],
  (cs, items) => (cs ? items.filter(d => !cs.has(d.item_code)) : [])
);

export const getMtPreFilteredElements = createSelector(us => {
  const elements = [
    {element_code: 0, element: 'Export'},
    {element_code: 1, element: 'Import'}
  ];
  return us ? elements.filter(d => !us.has(d.element_code)) : [];
});
