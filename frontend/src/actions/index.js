import {createAction} from 'redux-actions';
import co from 'co';
import {BACKEND_URL} from '../constants';
// Action Ids
export const UPDATE_SCREEN_SIZE = 'UPDATE_SCREEN_SIZE';
export const FETCH_DATA_START = 'FETCH_DATA_START';
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';

export const updateScreenSize = createAction(UPDATE_SCREEN_SIZE);
export const fetchDataStart = createAction(FETCH_DATA_START);
export const fetchDataSuccess = createAction(FETCH_DATA_SUCCESS);

export const fetchData = queryParams => dispatch => {
  dispatch(fetchDataStart());
  return co(function* load() {
    const name = 'qcut5.bin';
    const response = yield fetch(`${BACKEND_URL}/load_model?name=${name}`);
    const data = yield response.json();
    dispatch(fetchDataSuccess(data));
    return Promise.resolve(data);
  }).catch(err => {
    throw new Error(err);
  });
};
