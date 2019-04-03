import {createSelector} from 'reselect';
import {getRawTeSource, getRawTeTarget} from './raw';

export const getTeData = createSelector(
  [getRawTeSource, getRawTeTarget],
  (source, target) =>
    source && target
      ? {
        source,
        target
      }
      : null
);
