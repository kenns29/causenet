import {isArray} from './base';
/**
 * Check if the network is a cr bayesian network, cr bayesian network is defined
 * by have the first edge with the features defined by one of the following:
 * 1) "(feature, t)" in which
 * {t | t in {0, 1}} indicate either the feature is for row attribute or column
 * attribute
 * 2) [feature, t]
 */
export const isCrBayesianNetwork = network => {
  if (!network || network.length === 0) {
    return false;
  }
  const {source, target} = network[0];

  if (
    [source, target].every(
      d =>
        d &&
        ((isArray(d) && d.length === 2) ||
          (typeof d === 'string' && d.match(/^\s*\(\s*\w+\s*,\s*\w+\s*\)\s*$/)))
    )
  ) {
    return true;
  }
  return false;
};
