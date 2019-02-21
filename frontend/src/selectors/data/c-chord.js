import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {
  getRawCrRelations,
  getRawCrRelationFeatures,
  getRawBayesianNetwork,
  getRawCrMatrixFocus
} from './raw';

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
    });
  }
);
