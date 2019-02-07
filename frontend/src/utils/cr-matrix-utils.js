/**
 * Check if the network is a cr bayesian network, cr bayesian network is defined
 * by have at least one edge with the features defined by "(feature, t)" in which
 * {t | t in {0, 1}} indicate either the feature is for row attribute or column
 * attribute
 */
export const isCrBayesianNetwork = network => {
  if (!network || network.length === 0) {
    return false;
  }
  if (
    [network[0].source, network[0].target].some(
      d => !d || !d.match(/^\s*\(\s*\w+\s*,\s*\w+\s*\)\s*$/)
    )
  ) {
    return false;
  }
  return true;
};
