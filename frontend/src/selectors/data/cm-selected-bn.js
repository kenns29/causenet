import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {getRawCmSelectedBnFocusLink, getRawBayesianNetwork} from './raw';

const getCleanedBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  network =>
    network.map(({source, target, ...rest}) => {
      const [csource, ctarget] = [source, target].map(d => {
        const p = d.split(',').map(g => g.match(/-?\w+/)[0]);
        if (p.length > 2) {
          return [p[0], p[1], Number(p[2])];
        }
        if (p.length > 1) {
          return [p[0], '1', Number(p[1])];
        }
        return [p[0], '1', 0];
      });
      return {
        source,
        target,
        csource,
        ctarget,
        ...rest
      };
    })
);

const getCmFocusedBayesianNetwork = createSelector(
  [getRawCmSelectedBnFocusLink, getCleanedBayesianNetwork],
  (focus, network) => {}
);
