import { actionType } from '../../common/constants';
import { getSetupTree } from './refreshMetadata/setupTree';
import { getCustomObjectsDef } from './refreshMetadata/customObjectsDef';
import { getObjectMetadata } from './refreshMetadata/objectMetadata';
import { getApexClassesDef } from './refreshMetadata/apexClassesDef';
import { storeCommands } from './storeCommands';
import { getTriggersDef } from './refreshMetadata/triggersDef';

export const refreshMetadata = (request, sender, sendResponse, data) => {
  const { cookie } = request;
  let commands = {};

  commands['Refresh Metadata'] = {};
  commands['Setup'] = {};
  commands['OrgLimits'] = {};
  commands['clabels'] = {};

  Promise.all([
    getObjectMetadata(cookie, commands),
    getSetupTree(cookie, commands),
    getCustomObjectsDef(cookie, commands),
    getApexClassesDef(cookie, commands),
    getTriggersDef(cookie, commands)
  ]).then(() => {
    storeCommands({ ...request, payload: commands }, data);

    chrome.tabs.sendMessage(sender.tab.id, {
      action: actionType.REFRESH_METADATA_SUCCESS,
      commands
    });
  });

  // getProfilesDef();
  // getPagesDef();
  // getUsersDef();
  // getComponentsDef();
  // getSysPropsNFORCEDef();
  // getSysPropsLLCBIDef();
  // getFlowsDef();
};
