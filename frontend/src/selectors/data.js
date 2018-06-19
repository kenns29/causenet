import {createSelector} from 'reselect';
import {rootSelector} from './base';

export const getRawData = createSelector(rootSelector, state => state.data);
