import { fetchCookie } from './fetchCookie';
import { getCommands } from './getCommands';
import { getSettings } from './getSettings';
import { setSettings } from './setSettings';
import { getMetadata } from './getMetadata';
import { getLabels } from './getLabels';
import { actionType } from '../../common/constants';
import { queryCustomLabels } from './queryCustomLabels';
import { refreshMetadata } from './refreshMetadata';

export const actions = {
  [actionType.FETCH_COOKIE]: fetchCookie,
  [actionType.GET_COMMANDS]: getCommands,
  [actionType.GET_SETTINGS]: getSettings,
  [actionType.SET_SETTINGS]: setSettings,
  [actionType.GET_METADATA]: getMetadata,
  [actionType.QUERY_LABELS]: queryCustomLabels,
  [actionType.GET_LABELS]: getLabels,
  [actionType.REFRESH_METADATA]: refreshMetadata
};
