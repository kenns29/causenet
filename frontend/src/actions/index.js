import {createAction} from 'redux-actions';
import co from 'co';
import {BACKEND_URL} from '../constants';
// Action Ids
export const FETCH_DATA_START = 'FETCH_DATA_START';
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';

export const fetchDataStart = createAction(FETCH_DATA_START);
export const fetchDataSuccess = createAction(FETCH_DATA_SUCCESS);

export const fetchData = queryParams => dispatch => {
  dispatch(fetchDataStart());
  return co(function* load() {
    const response = yield fetch(`${BACKEND_URL}/loadmodel`);
    const data = yield response.json();
    dispatch(fetchDataSuccess(data));
    return Promise.resolve(data);
  }).catch(err => {
    throw new Error(err);
  });
};
