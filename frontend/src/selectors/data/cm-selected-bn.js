import {createSelector} from 'reselect';
import {rootSelector} from '../base';
import {
  getRawCmSelectedBnFocusLink,
  getRawBayesianNetwork,
  getRawCountries,
  getRawItems
} from './raw';
import {
  array2Object,
  linksToNodeMap,
  createDagLayout,
  getPathLinksThroughLink,
  getUndirectedPathLinksBetweenNodes
} from '../../utils';

const idToCid = id => {
  const p = id.split(',').map(g => g.match(/-?\w+/)[0]);
  if (p.length > 2) {
    return [p[0], p[1], Number(p[2])];
  }
  if (p.length > 1) {
    return [p[0], '1', Number(p[1])];
  }
  return [p[0], '1', 0];
};

const getCleanedBayesianNetwork = createSelector(
  getRawBayesianNetwork,
  network =>
    network.map(({source, target, ...rest}) => {
      const [csource, ctarget] = [source, target].map(idToCid);
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
    const {source, target, isSpurious} = focusLink;
    if (isSpurious) {
      return getUndirectedPathLinksBetweenNodes([source, target], network);
    }
    return getPathLinksThroughLink(focusLink, network);
  }
);

const getCountryIdToName = createSelector(getRawCountries, countries =>
  array2Object(countries, d => d.country_code, d => d.long_name)
);

const getItemIdToName = createSelector(getRawItems, items =>
  array2Object(items, d => d.item_code, d => d.item)
);

export const getCmSelectedBnLayout = createSelector(
  [getCmFocusedBayesianNetwork, getCountryIdToName, getItemIdToName],
  (network, fid2Name, cid2Name) => {
    const nmap = network.reduce((map, {source, target}) => {
      const [csource, ctarget] = [source, target].map(idToCid);
      [[source, csource], [target, ctarget]].forEach(([id, cid]) => {
        if (!map.hasOwnProperty(id)) {
          const [f, c, u] = cid;
          map[id] = {
            id,
            label: id,
            fname: fid2Name[f],
            cname: c === '-1' ? 'stability' : cid2Name[c],
            uname: u ? 'import' : 'export',
            width: 10,
            height: 10
          };
        }
      });
      return map;
    }, {});
    const nodes = Object.values(nmap);
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
