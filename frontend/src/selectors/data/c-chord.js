import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {
  getRawCrRelations,
  getRawCrRelationFeatures,
  getRawBayesianNetwork,
  getRawCrMatrixFocus
} from './raw';
import {array2Object} from '../../utils';

export const getCcBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  network => {
    return network.map(({source, target, ...rest}) => {
      const [s, t] = [source, target].map(d => {
        const p = d.split(',').map(g => g.match(/\w+/)[0]);
        return p.length > 2
          ? [p[0], p[1], Number(p[2])]
          : [p[0], '1', Number(p[1])];
      });
      return {
        ...rest,
        source,
        target,
        csource: s,
        ctarget: t
      };
    });
  }
);

export const getCcCategoryNetwork = createSelector(
  getCcBayesianNetwork,
  network => {
    const cmap = network.reduce((map, link) => {
      const {
        csource: [sf, sc, su],
        ctarget: [tf, tc, tu]
      } = link;
      const key = `${sc}-${tc}`;
      if (!map.hasOwnProperty(key)) {
        map[key] = {
          count: 0,
          source: sc,
          target: tc,
          links: []
        };
      }
      ++map[key].count;
      map[key].links.push(link);
      return map;
    }, {});

    return Object.entries(cmap).map(([id, link]) => ({id, ...link}));
  }
);
