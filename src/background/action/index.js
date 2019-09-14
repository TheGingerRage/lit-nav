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

export const types = {
  FETCH_COOKIE: 'Fetch Cookie',
  STORE_COMMANDS: 'Store Commands',
  GET_COMMANDS: 'Get Commands',
  GET_SETTINGS: 'Get Settings',
  SET_SETTINGS: 'Set Settings',
  STORE_METADATA: 'Store Metadata',
  GET_METADATA: 'Get Metadata',
  STORE_LABELS: 'Store Labels',
  GET_LABELS: 'Get Labels',
  LIGHTNING_METADATA: 'Lightning Metadata',
  VISUALFORCE_METADATA: 'VisualForce Metadata'
};

export const actions = {
  [types.FETCH_COOKIE]: fetchCookie,
  [types.STORE_COMMANDS]: storeCommands,
  [types.GET_COMMANDS]: getCommands,
  [types.GET_SETTINGS]: getSettings,
  [types.SET_SETTINGS]: setSettings,
  [types.GET_METADATA]: getMetadata,
  [types.STORE_LABELS]: storeLabels,
  [types.GET_LABELS]: getLabels,
  [types.LIGHTNING_METADATA]: lightningMetadata,
  [types.VISUALFORCE_METADATA]: visualForceMetadata
};
