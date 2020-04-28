import { combineReducers } from 'redux';

import alertsReducer from './alerts';
import configReducer from './config';

const rootReducer = combineReducers({
  alerts: alertsReducer,
  config: configReducer,
});

export default rootReducer;