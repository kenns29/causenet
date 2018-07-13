// @flow
import {fetch} from 'global';
import {progressBarFetch, setOriginalFetch} from 'react-fetch-progressbar';

setOriginalFetch(fetch);
export default progressBarFetch;
