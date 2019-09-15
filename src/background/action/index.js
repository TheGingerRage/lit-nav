import { fetchCookie } from './fetchCookie';
import { storeCommands } from './storeCommands';
import { getCommands } from './getCommands';
import { getSettings } from './getSettings';
import { setSettings } from './setSettings';
import { getMetadata } from './getMetadata';
import { storeLabels } from './storeLabels';
import { getLabels } from './getLabels';
import { lightningMetadata } from './lightningMetadata';
import { visualForceMetadata } from './visualForceMetadata';
import { actionType } from '../../common/constants';
import { queryCustomLabels } from './queryCustomLabels';

export const actions = {
  [actionType.FETCH_COOKIE]: fetchCookie,
  [actionType.STORE_COMMANDS]: storeCommands,
  [actionType.GET_COMMANDS]: getCommands,
  [actionType.GET_SETTINGS]: getSettings,
  [actionType.SET_SETTINGS]: setSettings,
  [actionType.GET_METADATA]: getMetadata,
  [actionType.QUERY_LABELS]: queryCustomLabels,
  [actionType.STORE_LABELS]: storeLabels,
  [actionType.GET_LABELS]: getLabels,
  [actionType.LIGHTNING_METADATA]: lightningMetadata,
  [actionType.VISUALFORCE_METADATA]: visualForceMetadata
};
