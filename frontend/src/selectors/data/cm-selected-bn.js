import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {getRawCmSelectedBnFocusLink, getRawBayesianNetwork} from './raw';
import {
  linksToNodeMap,
  createDagLayout,
  getPathLinksThroughLink
} from '../../utils';

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
  (focusLink, network) => {
    if (!focusLink) {
      return [];
    }
    return getPathLinksThroughLink(focusLink, network);
  }
);

export const getCmSelectedBnLayout = createSelector(
  getCmFocusedBayesianNetwork,
  network => {
    const nmap = linksToNodeMap(network);
    const nodes = Object.values(nmap);
    nodes.forEach(node => {
      node.width = 10;
      node.height = 10;
    });
    const links = network.map(({source, target, ...rest}) => {
      return {
        source: nmap[source],
        target: nmap[target],
        ...rest
      };
    });
    return createDagLayout({nodes, links}, null, d => d.id);
  }
);
