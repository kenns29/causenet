import {createSelector} from 'reselect';
import {getFeatureList} from './hierarchical-clustering';
import {createBayesianNetworkNodeLinkLayout} from '../../utils';
import {
  getBayesianNetworkNodeLinkLayoutData,
  getIsTemporalBayesianNetwork
} from './bayesian-network';

export const getBayesianNetworkNodeLinkLayout = createSelector(
  [
    getBayesianNetworkNodeLinkLayoutData,
    getFeatureList,
    getIsTemporalBayesianNetwork
  ],
  (nodeLink, features, isTemporal) => {
    console.log(JSON.stringify(nodeLink, null, 2));
    return createBayesianNetworkNodeLinkLayout(nodeLink, features, isTemporal);
  }
);
